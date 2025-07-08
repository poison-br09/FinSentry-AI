from sqlalchemy import Column, String, DateTime, ForeignKey, LargeBinary, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from uuid import uuid4
from datetime import datetime
from .db import Base

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class UploadedFile(Base):
    __tablename__ = "uploaded_files"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    session_id = Column(UUID(as_uuid=True), nullable=False)
    filename = Column(String, nullable=False)
    content_type = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow)

class ProcessedStatement(Base):
    __tablename__ = "processed_statements"

    id = Column(UUID(as_uuid=True), primary_key=True)
    session_id = Column(UUID(as_uuid=True), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    file_id = Column(UUID(as_uuid=True), ForeignKey("uploaded_files.id"))
    result_json = Column(Text, nullable=False)
    processed_at = Column(DateTime, default=datetime.utcnow)

    file = relationship("UploadedFile")
