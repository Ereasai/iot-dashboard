#!/home/ikess/.local/share/virtualenvs/database-server-JdVQlG4n/bin/python
import os
from os import environ as env
from socket import socket, AF_INET, SOCK_STREAM
from select import select
import sys
import json
import base64
import time
from time import ctime
from datetime import datetime, timedelta
import argparse
import logging
import queue
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.orm.session import Session
from model.models import Base, Thing, Value, ValueTag, Function, Argument, FunctionTag, ValueLog, BrokerLog
from sqlalchemy.engine.url import URL
from typing import List, Dict, Union

max_reconnection = 1

queue = queue.Queue()


def get_msg_str(s):
    if not isinstance(s, str):
        return s

    return str(s.encode('ascii', 'ignore'))[2:-1]


def serialize_if_json(input_text: str):
    try:
        input_text = input_text.replace('\\n', '')
        json_obj = json.loads(input_text)
        return json.dumps(json_obj, ensure_ascii=False).replace('\n', '')
    except ValueError:
        return input_text


class Crawler:
    def __init__(self, current_dir: str, middleware_host: str = '192.168.1.53', middleware_port: int = 58132, db_session: Session = None):
        print('path: {} host: {} port: {}'.format(current_dir, middleware_host, middleware_port))
        self.stdin_path = '/dev/null'
        self.stdout_path = '/dev/tty'
        self.stderr_path = '/dev/tty'
        self.pidfile_path = current_dir + '/crawler.pid'
        self.pidfile_timeout = 5
        self.current_dir = current_dir
        self.binary_dir = 'Binary_Directory'
        self.db_session = db_session
        self.middleware_host = middleware_host
        self.middleware_port = middleware_port
        self.middleware_name = ''
        self.header_len = 30

    def connect_socket(self):
        clientSocket = socket(AF_INET, SOCK_STREAM)
        ADDR = (self.middleware_host, self.middleware_port)

        try:
            print(f'>>> {str(datetime.now())}, {ADDR}')
            clientSocket.connect(ADDR)
        except Exception as e:
            print('==========================================')
            print('cannot connect to (%s:%s)' % ADDR)
            print(e)
            print('==========================================')
            raise
        else:
            print('==========================================')
            print('connected to (%s:%s)' % ADDR)
            print('==========================================')
        return clientSocket

    def safe_receive(self, sock, clientSocket, packet_len):
        chunks = []
        bytes_to_recv = packet_len
        bytes_recd = 0
        while bytes_recd < packet_len:
            data = sock.recv(bytes_to_recv)
            if not data:
                print('[INFO] Connection lost({}:{}) {}'.format(self.middleware_host, self.middleware_port, ctime()))
                clientSocket.close()
                event_time = str(datetime.now())

                # insert event into database
                msg = {}
                msg['time'] = event_time
                msg['topic'] = f'MW/INFO/DISCONNECTED/{self.middleware_name}'
                msg['payload'] = f'{self.middleware_host}:{self.middleware_port}'
                self.insert_broker_log(msg)
                sys.exit()
            else:
                bytes_to_recv = bytes_to_recv - len(data)
                bytes_recd = bytes_recd + len(data)
                chunks.append(data)
                # print('[INFO][{}] New message arrives from the InfoManager: '.format(ctime()))
                # print('[DEBUG] Append Data : {}'.format(data))

        # TODO(ikess): find out the best practice to handle chunks..
        s = b''
        # print('[DEBUG] Recieved message: {}'.format(s.join(chunks)))
        return s.join(chunks)

    def receive_header(self, sock, clientSocket):
        # print('[DEBUG] receive_header')
        # receive header with predefined length in class
        data = self.safe_receive(sock, clientSocket, self.header_len)
        # strip() is to trim data which might include empty spaces in the from
        # print('[DEBUG] receive_header data: {}'.format(data))
        return int(data.strip())

    def receive_body(self, sock, clientSocket, packet_len):
        # print('[DEBUG] receive_body')
        data = self.safe_receive(sock, clientSocket, packet_len)
        # print('[DEBUG] receive_body data: {}'.format(data))
        return data

    def get_type_str(self, type_int):
        type_str = ''
        if type_int == 0:
            type_str = 'int'
        elif type_int == 1:
            type_str = 'double'
        elif type_int == 2:
            type_str = 'bool'
        elif type_int == 3:
            type_str = 'string'
        elif type_int == 4:
            type_str = 'binary'
        elif type_int == 5:
            type_str = 'void'
        return type_str

    def insert_initial_thing_info(self, payload):
        # get object or string from json object
        # postfix (such as _str) is added in order to be distinguished from db entry
        msg = json.loads(payload)
        services = msg['services']
        for service in services:
            # get middleware info
            middleware_name = ''
            hierarchy = ''
            if service.get('hierarchy') != None:
                middleware_name = service['middleware']
                hierarchy = service['hierarchy']
                if hierarchy == "local":
                    self.middleware_name = middleware_name
                    # insert event into database
                    msg = {}
                    msg['time'] = str(datetime.now())
                    msg['topic'] = f'MW/INFO/CONNECTED/{self.middleware_name}'
                    msg['payload'] = ''
                    self.insert_broker_log(msg)
                    print('[insert_initial_thing_info] local middleware {}', self.middleware_name)
            thing_object = service['things']
            for thing in thing_object:
                if thing['is_alive'] == 0:
                    continue
                thing_name_str = get_msg_str(thing['name'])
                description_str = ''
                if 'description' in thing:
                    description_str = get_msg_str(thing['description'])

                # 1. Update thing info
                # check if thing already exists in db. If it does not, insert it
                thing_item = self.db_session.query(Thing).filter_by(thing_name=thing_name_str).first()
                if thing_item:
                    thing_item.is_registered = True
                    thing_item.middleware = middleware_name
                    print('[insert_initial_thing_info] Update Thing Name: {} | desc: {}', thing_name_str, description_str)
                else:
                    thing_item = Thing(
                        thing_name=thing_name_str,
                        thing_vname=thing_name_str,
                        thing_description=description_str,
                        is_registered=True,
                        middleware=middleware_name,
                    )
                    print('[insert_initial_thing_info] Register Thing Name: {} | desc: {}', thing_name_str, description_str)
                    self.db_session.add(thing_item)

                value_object: List[dict] = thing['values']
                function_object = thing['functions']

                self.db_session.commit()
                thing_id_entry = thing_item.thing_id

                # 2. Update value info
                for value in value_object:
                    value_name_str = get_msg_str(value['name'])
                    value_desc_str = get_msg_str(value['description'])
                    value_type_str = get_msg_str(value['type'])
                    value_min_entry = float(value['bound']['min_value'])
                    value_max_entry = float(value['bound']['max_value'])

                    value_item = self.db_session.query(Value).filter_by(value_name=value_name_str, thing_id=thing_id_entry).first()
                    if value_type_str != "binary":
                        # check if value already exists in db, if not insert it
                        if value_item == None:
                            value_item = Value(
                                thing_id=thing_id_entry,
                                value_name=value_name_str,
                                value_type=value_type_str,
                                value_description=value_desc_str,
                                value_min=value_min_entry,
                                value_max=value_max_entry,
                            )
                            print(
                                '[insert_initial_thing_info] Value Name: {} | Type: {} | Min: {} | Max: {}',
                                value_name_str,
                                value_type_str,
                                value_min_entry,
                                value_max_entry,
                            )
                            self.db_session.add(value_item)
                        else:
                            value_item.value_description = value_desc_str
                            value_item.value_type = value_type_str
                            value_item.value_min = value_min_entry
                            value_item.value_max = value_max_entry

                        # insert initial value
                        if value_type_str in ['int', 'double', 'bool'] and 'latest_val' in value.keys():
                            str_latest_value = value['latest_val']
                            print(f'value type:{value_type_str}, latest value: {str_latest_value}')
                            latest_value = 0
                            if value_type_str == 'int':
                                latest_value = int(str_latest_value)
                            elif value_type_str == 'double':
                                latest_value = float(str_latest_value)
                            elif value_type_str == 'bool':
                                latest_value = int(str_latest_value)
                            initial_value_msg = {
                                'time': value['updated_on'],
                                'thing_name': thing['name'],
                                'value_name': value['name'],
                                'value': latest_value,
                            }
                            print(f'[insert_initial_value] {initial_value_msg}')
                            self.insert_sensor_value(initial_value_msg)

                    else:
                        value_format_str = get_msg_str(value['format'])
                        # check if value already exists in db, if not insert it
                        if value_item == None:
                            value_item = Value(
                                thing_id=thing_id_entry,
                                value_name=value_name_str,
                                value_description=value_desc_str,
                                value_type=value_type_str,
                                value_min=value_min_entry,
                                value_max=value_max_entry,
                            )
                            print(
                                '[insert_initial_thing_info] Value Name: {} | Type: {} | Min: {} | Max: {} | format: {}',
                                value_name_str,
                                value_type_str,
                                value_min_entry,
                                value_max_entry,
                                value_format_str,
                            )
                            self.db_session.add(value_item)
                        else:
                            value_item.value_description = value_desc_str
                            value_item.value_type = value_type_str
                            value_item.value_min = value_min_entry
                            value_item.value_max = value_max_entry

                    self.db_session.commit()

                    # 3. Update value tag info
                    value_tag_object = value['tags']
                    for tag in value_tag_object:
                        tag_name = get_msg_str(tag['name'])
                        tag_item = self.db_session.query(ValueTag).filter_by(name=tag_name, value_id=value_item.value_id).first()
                        if tag_item == None:
                            tag_item = ValueTag(name=tag_name, value_id=value_item.value_id)
                            self.db_session.add(tag_item)
                            self.db_session.commit()
                            print('[insert_initial_thing_info] Value tag Name: {}', tag_name)

                # 4. Update function info
                for function in function_object:
                    function_name_str = get_msg_str(function['name'])
                    function_desc_str = get_msg_str(function['description'])
                    function_return_type_str = get_msg_str(function['return_type'])
                    function_use_arg = function['use_arg']

                    # check if function already exists in db, if not insert it
                    function_item = self.db_session.query(Function).filter_by(function_name=function_name_str, thing_id=thing_id_entry).first()
                    if function_item == None:
                        function_item = Function(
                            thing_id=thing_id_entry,
                            function_name=function_name_str,
                            function_description=function_desc_str,
                            function_return_type=function_return_type_str,
                            function_use_arg=function_use_arg,
                        )
                        print('[insert_initial_thing_info] Function Name: {} | Thing Id: {}'.format(function_name_str, thing_id_entry))
                        self.db_session.add(function_item)
                    else:
                        function_item.function_description = function_desc_str
                        function_item.function_return_type = function_return_type_str
                        function_item.function_use_arg = function_use_arg

                    self.db_session.commit()

                    # 5. Update argument info of function if exists
                    if function_use_arg == 1:
                        argument_object = function['arguments']
                        for argument in argument_object:
                            argument_name_str = get_msg_str(argument['name'])
                            argument_order = argument['order']
                            argument_type_str = get_msg_str(argument['type'])
                            argument_min = float(argument['bound']['min_value'])
                            argument_max = float(argument['bound']['max_value'])
                            argument_item = (
                                self.db_session.query(Argument)
                                .filter_by(argument_name=argument_name_str, function_id=function_item.function_id)
                                .first()
                            )
                            if argument_item == None:
                                argument_item = Argument(
                                    function_id=function_item.function_id,
                                    argument_name=argument_name_str,
                                    argument_order=argument_order,
                                    argument_type=argument_type_str,
                                    argument_min=argument_min,
                                    argument_max=argument_max,
                                )
                                print(
                                    '[insert_initial_thing_info] Argument Name: {} | Order: {} Type: {}'.format(
                                        argument_name_str, argument_order, argument_type_str
                                    )
                                )
                                self.db_session.add(argument_item)
                            else:
                                argument_item.argument_type = argument_type_str
                                argument_item.argument_max = argument_max
                                argument_item.argument_min = argument_min
                                argument_item.argument_order = argument_order
                            self.db_session.commit()
                    # 6. Update function tag info
                    function_tag_object = function['tags']
                    for tag in function_tag_object:
                        tag_name = get_msg_str(tag['name'])
                        tag_item = self.db_session.query(FunctionTag).filter_by(name=tag_name, function_id=function_item.function_id).first()
                        if tag_item == None:
                            tag_item = FunctionTag(name=tag_name, function_id=function_item.function_id)
                            print('[insert_initial_thing_info] Function tag Name: {}', tag_name)
                            self.db_session.add(tag_item)
                            self.db_session.commit()

    def insert_sensor_value(self, msg):
        # get object or string from json object
        time_str = get_msg_str(msg['time'])
        thing_name_str = get_msg_str(msg['thing_name'])
        value_name_str = get_msg_str(msg['value_name'])
        value_entry = get_msg_str(msg['value'])

        thing_id_entry = self.db_session.query(Thing).filter_by(thing_name=thing_name_str).first()
        if thing_id_entry == None:
            print(f'[insert_sensor_value] No such thing with name: {thing_name_str}')
            return
        if thing_id_entry.middleware not in ['', self.middleware_name]:
            return

        # get value entry to put in value log table
        value_id_entry = self.db_session.query(Value).filter_by(thing_id=thing_id_entry.thing_id, value_name=value_name_str).first()

        # insert value log
        if value_id_entry.value_type in ['int', 'double', 'bool']:
            value_log_item = ValueLog(value_id=value_id_entry.value_id, created_at=time_str, value=value_entry)
        elif value_id_entry.value_type == 'string':
            value_log_item = ValueLog(value_id=value_id_entry.value_id, created_at=time_str, value_string=value_entry)
        elif value_id_entry.value_type == "binary":
            decoded_binary = base64.b64decode(msg['value'])

            # insert value log to get the id of it
            value_log_item = ValueLog(value_id=value_id_entry.value_id, created_at=time_str)

            # get id of value log
            value_log_id = value_log_item.log_id

            # make file name of the binary
            file_name = str(value_log_id) + '.' + value_id_entry.value_format

            # make path for binary file
            relative_path = thing_name_str + '/' + value_name_str
            # ex. path in DB => Binary_Directory/thing_name_str/value_name_str
            path_in_db = os.path.join(self.binary_dir, relative_path)
            # ex. full path => static/Binary_Directory/thing_name_str/value_name_str
            full_path = os.path.join(self.current_dir + '/' + app_name + '/' + '/static/', path_in_db)

            # check if directory already exists, if not make one
            if not os.path.exists(full_path):
                os.makedirs(full_path)

            # set file_path then make binary file
            file_path = full_path + '/' + file_name
            with open(file_path, 'wb') as f:
                f.write(decoded_binary)

            file_path_in_db = path_in_db + '/' + file_name
            value_log_item.path = file_path_in_db
            self.db_session.add(value_log_item)
            print('save a ValueLog to {}'.format(value_log_item.path))

        else:
            print(f'[insert_sensor_value] No such value type: {value_id_entry.value_type}')

        msg['value_min'] = value_id_entry.value_min
        msg['value_max'] = value_id_entry.value_max
        msg['middleware'] = self.middleware_name
        queue.put(msg)

        print(
            f'[insert_sensor_value] Thing Name: {thing_name_str} Value Id: {value_id_entry.value_id} | Name: {value_id_entry.value_name} | Type: {value_id_entry.value_type}'
        )

        self.db_session.add(value_log_item)
        self.db_session.commit()

    def insert_broker_log(self, msg):
        time_str = get_msg_str(msg['time'])
        topic_str = get_msg_str(msg['topic'])
        payload_str = get_msg_str(msg['payload'])

        print('[insert_broker_log] Topic: {} | Payload: {}'.format(topic_str, payload_str))

        broker_log_item = BrokerLog(created_at=time_str, topic=topic_str, payload=payload_str)
        self.db_session.add(broker_log_item)
        self.db_session.commit()

    def insert_register_thing(self, msg):
        # get object or string from json object
        # postfix (such as _str) is added in order to be distinguished from db entry
        thing_name_str = get_msg_str(msg['name'])
        value_object = msg['values']
        function_object = msg['functions']
        description_str = None

        if 'description' in msg:
            description_str = get_msg_str(msg['description'])

        # check if thing already exists in db. If it does not, insert it
        thing_item = self.db_session.query(Thing).filter_by(thing_name=thing_name_str).first()
        if thing_item:
            thing_item.is_registered = True
            thing_item.middleware = self.middleware_name
        else:
            thing_item = Thing(
                thing_name=thing_name_str,
                thing_vname=thing_name_str,
                thing_description=description_str,
                is_registered=True,
                middleware=self.middleware_name,
            )
            self.db_session.add(thing_item)
            print('[insert_register_thing] Register Thing Name: {} | desc: {}', thing_name_str, description_str)

        self.db_session.commit()
        thing_id_entry = thing_item.thing_id

        for value in value_object:
            value_name_str = get_msg_str(value['name'])
            value_description_str = get_msg_str(value['description'])
            value_type_str = get_msg_str(value['type'])
            value_min_entry = float(value['bound']['min_value'])
            value_max_entry = float(value['bound']['max_value'])

            value_item = self.db_session.query(Value).filter_by(value_name=value_name_str, thing_id=thing_id_entry).first()
            # if value type is not binary
            if value_type_str != "binary":
                # get thing entry to put in value table
                # print("thing id: {}".format(thing_id_entry))
                # check if value already exists in db, if not insert it
                if value_item == None:
                    value_item = Value(
                        thing_id=thing_id_entry,
                        value_name=value_name_str,
                        value_type=value_type_str,
                        value_description=value_description_str,
                        value_min=value_min_entry,
                        value_max=value_max_entry,
                    )
                    self.db_session.add(value_item)
                    print(
                        '[insert_register_thing] Value Name: {} | Type: {} | Min: {} | Max: {}',
                        value_name_str,
                        value_type_str,
                        value_min_entry,
                        value_max_entry,
                    )
                else:
                    value_item.value_description = value_description_str
                    value_item.value_type = value_type_str
                    value_item.value_min = value_min_entry
                    value_item.value_max = value_max_entry
            else:
                value_format_str = value['format'].encode('ascii', 'ignore')
                # check if value already exists in db, if not insert it
                if value_item == None:
                    value_item = Value(
                        thing_id=thing_id_entry,
                        value_name=value_name_str,
                        value_type=value_type_str,
                        value_format=value_format_str,
                        value_description=value_description_str,
                        value_min=value_min_entry,
                        value_max=value_max_entry,
                    )
                    self.db_session.add(value_item)
                else:
                    value_item.value_description = value_description_str
                    value_item.value_type = value_type_str
                    value_item.value_min = value_min_entry
                    value_item.value_max = value_max_entry

            self.db_session.commit()

            # Update value tag info
            value_tag_object = value['tags']
            for tag in value_tag_object:
                tag_name = get_msg_str(tag['name'])
                tag_item = self.db_session.query(ValueTag).filter_by(name=tag_name, value_id=value_item.value_id).first()
                if tag_item == None:
                    tag_item = ValueTag(name=tag_name, value_id=value_item.value_id)
                    self.db_session.add(tag_item)
                    print('[insert_register_thing] Value tag Name: {}', tag_name)
                self.db_session.commit()

        for function in function_object:
            # print('[insert_register_thing] function: {}'.format(function))
            function_name_str = get_msg_str(function['name'])
            function_description_str = get_msg_str(function['description'])
            function_return_type_str = get_msg_str(function['return_type'])
            function_use_arg = function['use_arg']

            function_item = self.db_session.query(Function).filter_by(function_name=function_name_str, thing_id=thing_id_entry).first()
            if function_item == None:
                function_item = Function(
                    thing_id=thing_id_entry,
                    function_name=function_name_str,
                    function_description=function_description_str,
                    function_return_type=function_return_type_str,
                )

                print('[insert_register_thing] Function Name: {} | Thing Id: {}'.format(function_name_str, thing_id_entry))
                self.db_session.add(function_item)
            else:
                function_item.function_description = function_description_str
                function_item.function_return_type = function_return_type_str
                function_item.function_use_arg = function_use_arg

            self.db_session.commit()

            if function_use_arg == 0:
                continue
            argument_object = function['arguments']
            for i, argument in enumerate(argument_object):
                # print('[insert_register_thing] argument: {}'.format(argument))
                argument_name_str = get_msg_str(argument['name'])
                argument_order = i
                argument_type_str = get_msg_str(argument['type'])
                argument_min = float(argument['bound']['min_value'])
                argument_max = float(argument['bound']['max_value'])
                argument_item = (
                    self.db_session.query(Argument).filter_by(argument_name=argument_name_str, function_id=function_item.function_id).first()
                )
                if argument_item == None:
                    argument_item = Argument(
                        function_id=function_item.function_id,
                        argument_name=argument_name_str,
                        argument_type=argument_type_str,
                        argument_min=argument_min,
                        argument_max=argument_max,
                        argument_order=argument_order,
                    )

                    print('[insert_register_thing] Argument Name: {} | Type: {}'.format(argument_name_str, argument_type_str))
                    self.db_session.add(argument_item)
                else:
                    argument_item.argument_type = argument_type_str
                    argument_item.argument_max = argument_max
                    argument_item.argument_min = argument_min
                    argument_item.argument_order = argument_order
                self.db_session.commit()
            # Update function tag info
            function_tag_object = function['tags']
            for tag in function_tag_object:
                tag_name = get_msg_str(tag['name'])
                tag_item = self.db_session.query(FunctionTag).filter_by(name=tag_name, function_id=function_item.function_id).first()
                if tag_item == None:
                    tag_item = FunctionTag(name=tag_name, function_id=function_item.function_id)
                    print('[insert_register_thing] Function tag Name: {}', tag_name)
                    self.db_session.add(tag_item)
                self.db_session.commit()

        event_time = datetime.now()
        msg['time'] = str(event_time)
        msg['topic'] = f'MW/INFO/REGISTER/{thing_name_str}'
        msg['payload'] = 'No alive message'
        self.insert_broker_log(msg)

        return thing_name_str

    def insert_unregister_thing(self, msg):
        event_time = datetime.now()
        thing_name_str = get_msg_str(msg['thing_name'])
        thing_entry = self.db_session.query(Thing).filter_by(thing_name=thing_name_str).first()
        if thing_entry == None:
            return
        thing_entry.is_registered = False
        print('[insert_unregister_thing] Unregister Thing Name: {}'.format(thing_name_str))
        self.db_session.commit()

        # check if the thing is unregistered manually.
        # (check if there's unregister message in the broker log)
        if (
            self.db_session.query(BrokerLog)
            .filter_by(topic=f'TM/UNREGISTER/{thing_name_str}')
            .filter(BrokerLog.created_at >= str(event_time - timedelta(seconds=10)))
            .first()
        ):
            return

        msg['time'] = str(event_time)
        msg['topic'] = f'MW/INFO/UNREGISTER/{thing_name_str}'
        msg['payload'] = 'No alive message'
        self.insert_broker_log(msg)

        email_subject = f'{thing_name_str} Has Been Unregistered'
        content = f'{event_time}, {thing_name_str} has been unregistered by middleware({self.middleware_name}, {self.middleware_host})\n \
            due to alive timeout'
        # send_email_notification(email_subject, content)

    def run(self):
        os.environ["TZ"] = "Asia/Seoul"
        time.tzset()

        # connect to middleware
        clientSocket = self.connect_socket()

        # reset all status of things as is_registered=false in thing table
        # self.db_session.query(Thing).update({Thing.is_registered: False})
        # self.db_session.commit()

        # receive packet from middleware
        while True:
            try:
                connection_list = [clientSocket]
                # since select function returns triple of lists, allocate first element of its return value to read_socket
                read_socket = select(connection_list, [], [], 10)[0]

                for sock in read_socket:
                    if sock == clientSocket:
                        # receive header in order to know the length of the body
                        packet_len = self.receive_header(sock, clientSocket)
                        # print('receive_header packet_len: {}'.format(packet_len))

                        # receive body according to the length informed by header
                        data = self.receive_body(sock, clientSocket, packet_len)
                        # print('handling data: {}'.format(data))

                        # parse json object then get message type
                        msg = json.loads(data.decode())
                        msgtype = msg['msg_type']
                        # print('messaged decoded. msg type: {} msg: {}'.format(msgtype, msg))
                        if msgtype == 'thing_info':
                            print('payload: {}'.format(msg['payload']))
                            self.insert_initial_thing_info(msg['payload'])
                        elif msgtype == 'sensor_value':
                            # self.data_analysis(msg)
                            self.insert_sensor_value(msg)
                        elif msgtype == 'broker_log':
                            self.insert_broker_log(msg)
                        elif msgtype == 'register_thing':
                            thing_name_str = self.insert_register_thing(msg)
                            # FIXME add hierarchcal middleware
                            # print("thing_name: %s" % thing_name_str)
                            # packet = self.make_packet_about_access_modifier(
                            #     thing_name_str)
                            # print("packet: %s" % packet)
                            # self.send_packet_to_middleware(packet)
                            # print("send message about access_modifier")
                        elif msgtype == 'unregister_thing':
                            print('Test 5')
                            self.insert_unregister_thing(msg)
                        else:
                            print("Message type not supported!")
            except Exception as e:
                logging.exception("[{}] Error occurs while handling message: {}".format(ctime(), e))

        # close socket then exit when it's over
        clientSocket.close()
        sys.exit()


def argparser() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("-H", '--host', type=str, help="middleware host address", default='localhost')
    parser.add_argument("-P", '--port', type=int, help="middleware port", default=58132)
    args = parser.parse_args()
    return args


if __name__ == "__main__":
    args = argparser()

    username = os.getenv('DB_USER', 'myssix')
    password = os.getenv('DB_PASS', 'test12')
    host = os.getenv('DB_HOST', 'localhost')
    port = os.getenv('DB_PORT', '5432')
    database = os.getenv('DB_NAME', 'myssix_db')

    print("ENV VARIABLES:")
    print("DB_USER:", username)
    print("DB_PASS:", password)
    print("DB_HOST:", host)
    print("DB_PORT:", port)
    print("DB_NAME:", database)
    print("args:", args)

    engine = create_engine(URL.create("postgresql+psycopg2", username=username, password=password, host=host, port=port, database=database))
    Base.metadata.create_all(engine)
    session_maker = sessionmaker(bind=engine)
    session: Session = session_maker()

    print(f"Running crawler...")
    crawler = Crawler(current_dir='.', middleware_host=args.host, middleware_port=args.port, db_session=session)
    retries = 0
    while retries <= max_reconnection:
        try:
            crawler.run()
        except Exception as e:
            logging.exception("[{}] Error occurs while handling message: {}".format(ctime(), e))
            time.sleep(5)
            retries = retries + 1

    session.close()
    engine.dispose()
