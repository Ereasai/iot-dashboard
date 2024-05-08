import os
import sys
import pytest
import json
from datetime import datetime, timedelta
from sqlalchemy import create_engine, MetaData
from sqlalchemy.orm import scoped_session, sessionmaker
from config.setting import ConfigTest
from model.models import Base, Thing, Value, ValueTag, Function, Argument, FunctionTag, ValueLog, BrokerLog
import crawler


src_path = os.path.dirname(os.path.abspath(os.path.dirname(__file__)))
sys.path.append(src_path)


@ pytest.fixture(scope="module")
def setup_database():
    print('***** SETUP *****')
    db_engine = create_engine(ConfigTest.SQLALCHEMY_DATABASE_URI)
    metadata = Base.metadata
    metadata.create_all(db_engine)
    session = scoped_session(sessionmaker(db_engine))
    session.autoflush = True
    yield  session
    print('***** TEARDOWN *****')
    session.remove()
    metadata.reflect(db_engine)
    metadata.drop_all(db_engine, checkfirst=True)
    print('All test tables have been deleted.')
    db_engine.dispose()


@ pytest.fixture(scope="module")
def init_crawler(setup_database):
    print('***** SETUP crawler *****')
    middleware_host = '127.0.0.1'
    middleware_port = 58999
    db_session = setup_database
    crawler_obj = crawler.Crawler('.', middleware_host, middleware_port, db_session)
    return crawler_obj


def test_1_connect_socket_exception(init_crawler):
    with pytest.raises(Exception):
        crawler_obj = init_crawler
        crawler_obj.connect_socket()


def test_2_database_connection(setup_database):
    session = setup_database
    print (session.execute("select 1").scalar())


def test_3_thing_info_message_handling(init_crawler):
    json_data = {}
    with open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'example_payloads/thing_info.json')) as json_file:
        json_data = json.load(json_file)
    crawler_obj = init_crawler
    crawler_obj.insert_initial_thing_info(json.dumps(json_data))

    registered_thing = crawler_obj.db_session.query(Thing).filter_by(thing_name=json_data['services'][0]['things'][0]["id"]).first()
    assert registered_thing != None

    value_name = json_data['services'][0]['things'][0]["values"][0]["name"]
    registered_value = crawler_obj.db_session.query(Value).filter_by(thing_id=registered_thing.thing_id, value_name=value_name).first()
    assert registered_value != None
    assert crawler_obj.db_session.query(ValueTag).filter_by(value_id=registered_value.value_id).first()
    function_name = json_data['services'][0]['things'][0]["functions"][0]["name"]
    registered_function = crawler_obj.db_session.query(Function).filter_by(thing_id=registered_thing.thing_id, function_name=function_name).first()
    assert registered_function != None
    assert crawler_obj.db_session.query(FunctionTag).filter_by(function_id=registered_function.function_id).first()


def test_4_sensor_value_message_handling(init_crawler):
    json_data = {}
    with open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'example_payloads/sensor_value.json')) as json_file:
        json_data = json.load(json_file)
    crawler_obj = init_crawler
    crawler_obj.insert_sensor_value(json_data)

    thing_id = crawler_obj.db_session.query(Thing).filter_by(thing_name=json_data['thing_name']).first().thing_id
    value_id = crawler_obj.db_session.query(Value).filter_by(thing_id=thing_id, value_name=json_data['value_name']).first().value_id
    assert crawler_obj.db_session.query(ValueLog).filter_by(value_id=value_id).filter(ValueLog.created_at >= json_data['time']).first()


def test_5_broker_log_message_handling(init_crawler):
    json_data = {}
    with open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'example_payloads/broker_log.json')) as json_file:
        json_data = json.load(json_file)
    crawler_obj = init_crawler
    crawler_obj.insert_broker_log(json_data)

    assert crawler_obj.db_session.query(BrokerLog).filter_by(topic=json_data['topic']).filter(BrokerLog.created_at >= json_data['time']).first()


def test_6_register_thing_message_handling(init_crawler):
    json_data = {}
    with open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'example_payloads/register_thing.json')) as json_file:
        json_data = json.load(json_file)
    crawler_obj = init_crawler
    crawler_obj.insert_register_thing(json_data)

    registered_thing = crawler_obj.db_session.query(Thing).filter_by(thing_name=json_data['thing_name']).first()
    assert registered_thing != None
    assert registered_thing.is_registered == True
    registered_value = crawler_obj.db_session.query(Value).filter_by(thing_id=registered_thing.thing_id, value_name=json_data['values'][0]['name']).first()
    assert registered_value != None
    assert crawler_obj.db_session.query(ValueTag).filter_by(value_id=registered_value.value_id).first()
    registered_function = crawler_obj.db_session.query(Function).filter_by(thing_id=registered_thing.thing_id, function_name=json_data['functions'][0]["name"]).first()
    assert registered_function != None
    assert crawler_obj.db_session.query(FunctionTag).filter_by(function_id=registered_function.function_id).first()


def test_7_unregister_thing_message_handling(init_crawler):
    json_data = {}
    with open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'example_payloads/unregister_thing.json')) as json_file:
        json_data = json.load(json_file)
    crawler_obj = init_crawler
    crawler_obj.insert_unregister_thing(json_data)

    thing_item = crawler_obj.db_session.query(Thing).filter_by(thing_name=json_data['thing_name']).first()
    assert thing_item.is_registered == False


def test_8_reregister_thing(init_crawler):
    json_data = {}
    with open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'example_payloads/register_thing.json')) as json_file:
        json_data = json.load(json_file)
    crawler_obj = init_crawler
    crawler_obj.insert_register_thing(json_data)

    thing_item = crawler_obj.db_session.query(Thing).filter_by(thing_name=json_data['thing_name']).first()
    assert thing_item != None
    assert thing_item.is_registered == True


def test_9_add_value_tag_message_handling(init_crawler):
    json_data = {}
    with open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'example_payloads/add_value_tag.json')) as json_file:
        json_data = json.load(json_file)
    crawler_obj = init_crawler
    crawler_obj.insert_add_tag(json_data)

    thing_id = crawler_obj.db_session.query(Thing).filter_by(thing_name=json_data['thing']).first().thing_id
    value_id = crawler_obj.db_session.query(Value).filter_by(thing_id=thing_id, value_name=json_data['service']).first().value_id
    assert crawler_obj.db_session.query(ValueTag).filter_by(value_id=value_id, name=json_data['tag']).first()


def test_10_delete_value_tag_message_handling(init_crawler):
    json_data = {}
    with open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'example_payloads/delete_value_tag.json')) as json_file:
        json_data = json.load(json_file)
    crawler_obj = init_crawler
    crawler_obj.insert_delete_tag(json_data)

    thing_id = crawler_obj.db_session.query(Thing).filter_by(thing_name=json_data['thing']).first().thing_id
    value_id = crawler_obj.db_session.query(Value).filter_by(thing_id=thing_id, value_name=json_data['service']).first().value_id
    assert crawler_obj.db_session.query(ValueTag).filter_by(value_id=value_id, name=json_data['tag']).first() == None


def test_11_add_function_tag_message_handling(init_crawler):
    json_data = {}
    with open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'example_payloads/add_function_tag.json')) as json_file:
        json_data = json.load(json_file)
    crawler_obj = init_crawler
    crawler_obj.insert_add_tag(json_data)

    thing_id = crawler_obj.db_session.query(Thing).filter_by(thing_name=json_data['thing']).first().thing_id
    function_id = crawler_obj.db_session.query(Function).filter_by(thing_id=thing_id, function_name=json_data['service']).first().function_id
    assert crawler_obj.db_session.query(FunctionTag).filter_by(function_id=function_id, name=json_data['tag']).first()


def test_12_delete_function_tag_message_handling(init_crawler):
    json_data = {}
    with open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'example_payloads/delete_function_tag.json')) as json_file:
        json_data = json.load(json_file)
    crawler_obj = init_crawler
    crawler_obj.insert_delete_tag(json_data)

    thing_id = crawler_obj.db_session.query(Thing).filter_by(thing_name=json_data['thing']).first().thing_id
    function_id = crawler_obj.db_session.query(Function).filter_by(thing_id=thing_id, function_name=json_data['service']).first().function_id
    assert crawler_obj.db_session.query(FunctionTag).filter_by(function_id=function_id, name=json_data['tag']).first() == None


def test_13_unregister_notification_timeout(init_crawler, mocker):
    crawler.notification = True
    crawler_obj = init_crawler

    mocked_send_email_notification = mocker.patch('crawler.send_email_notification')

    json_data = {}
    with open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'example_payloads/unregister_thing.json')) as json_file:
        json_data = json.load(json_file)
    crawler_obj.insert_unregister_thing(json_data)

    assert mocked_send_email_notification.called


def test_14_unregister_notification(init_crawler, mocker):
    crawler.notification = True
    crawler_obj = init_crawler

    json_data = {}
    with open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'example_payloads/broker_log_unregister.json')) as json_file:
        json_data = json.load(json_file)
    event_time = datetime.now()
    json_data['time'] = str(event_time)
    crawler_obj.insert_broker_log(json_data)

    mocked_send_email_notification = mocker.patch('crawler.send_email_notification')

    json_data = {}
    with open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'example_payloads/unregister_thing.json')) as json_file:
        json_data = json.load(json_file)
    crawler_obj.insert_unregister_thing(json_data)

    assert mocked_send_email_notification.called == False
