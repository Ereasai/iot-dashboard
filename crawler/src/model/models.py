from sqlalchemy import MetaData, Column, ForeignKey, UniqueConstraint, Integer, Float, Boolean, String, Text, DateTime
from sqlalchemy.orm import relationship, configure_mappers
from sqlalchemy.ext.declarative import declarative_base

# reference https://stackoverflow.com/questions/41004540/using-sqlalchemy-models-in-and-out-of-flask/41014157
# metadata = MetaData()
# Base = declarative_base(metadata=metadata)

Base = declarative_base()


class Thing(Base):
    __tablename__ = 'things'

    thing_id = Column(Integer, primary_key=True)
    thing_name = Column(String(100), unique=True, index=True, nullable=False)
    is_registered = Column(Boolean, nullable=False)
    thing_vname = Column(String(100), default='')
    thing_description = Column(String(256), default='')
    middleware = Column(String(100), default='')
    hierarchy = Column(String(10), default='local')

    # relationship
    functions = relationship('Function')
    values = relationship('Value', backref="thing", lazy="dynamic")


class Function(Base):
    __tablename__ = 'functions'

    function_id = Column(Integer, primary_key=True)
    thing_id = Column(Integer, ForeignKey('things.thing_id', ondelete="CASCADE"), nullable=False)
    function_name = Column(String(100), nullable=False)
    function_return_type = Column(String(12))
    function_use_arg = Column(Boolean, default=False)
    function_description = Column(Text, default='')

    # relationship
    arguments = relationship('Argument')
    tags = relationship('FunctionTag')

    __table_args__ = (UniqueConstraint(thing_id, function_name),)


class Argument(Base):
    __tablename__ = 'arguments'

    argument_id = Column(Integer, primary_key=True)
    function_id = Column(Integer, ForeignKey('functions.function_id', ondelete="CASCADE"), nullable=False)
    argument_name = Column(String(100), nullable=False)
    argument_type = Column(String(12))
    argument_order = Column(Integer)
    argument_min = Column(Float)
    argument_max = Column(Float)

    __table_args__ = (UniqueConstraint(function_id, argument_name),)


class FunctionTag(Base):
    __tablename__ = 'function_tags'

    tag_id = Column(Integer, primary_key=True)
    function_id = Column(Integer, ForeignKey('functions.function_id', ondelete="CASCADE"), nullable=False)
    name = Column(String(100), nullable=False)

    __table_args__ = (UniqueConstraint(function_id, name),)


class Value(Base):
    __tablename__ = 'values'

    value_id = Column(Integer, primary_key=True)
    thing_id = Column(Integer, ForeignKey('things.thing_id', ondelete="CASCADE"), nullable=False)
    value_name = Column(String(100), nullable=False)
    value_type = Column(String(12), nullable=False)
    value_min = Column(Float)
    value_max = Column(Float)
    value_format = Column(String(8))
    value_description = Column(String(256), default='')

    # relationship
    tags = relationship('ValueTag')
    logs = relationship('ValueLog', backref="value_obj", lazy="dynamic")

    __table_args__ = (UniqueConstraint(thing_id, value_name),)


class ValueTag(Base):
    __tablename__ = 'value_tags'

    tag_id = Column(Integer, primary_key=True)
    value_id = Column(Integer, ForeignKey('values.value_id', ondelete="CASCADE"), nullable=False)
    name = Column(String(100), nullable=False)

    __table_args__ = (UniqueConstraint(value_id, name),)


class ValueLog(Base):
    __tablename__ = 'value_logs'

    log_id = Column(Integer, primary_key=True)
    value_id = Column(Integer, ForeignKey('values.value_id', ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime(timezone=True), nullable=False)
    value = Column(Float, nullable=True)
    value_string = Column(String, nullable=True)
    path = Column(Text)


class BrokerLog(Base):
    __tablename__ = 'broker_logs'

    log_id = Column(Integer, primary_key=True)
    created_at = Column(DateTime(timezone=True), nullable=False)
    topic = Column(Text, nullable=False)
    payload = Column(Text, default='')


class DataLog(Base):
    __tablename__ = 'data_logs'

    log_id = Column(Integer, primary_key=True)
    created_at = Column(DateTime(timezone=True), nullable=False)
    thing_name = Column(String(100), nullable=False)
    middleware = Column(String(100), default='')
    value_name = Column(String(100), nullable=False)
    value_type = Column(String(12))
    value = Column(Float, nullable=False)
    valid = Column(Boolean, default=True)
    abnormal = Column(Boolean, default=False)
    abnormal_description = Column(Text, default='')
