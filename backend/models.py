from sqlalchemy import Boolean, Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from database import Base

class Admin(Base):
    __tablename__ = "admins"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True)
    hashed_password = Column(String(255))
    role = Column(String(20), default="user") # "admin", "manager", "user"

class FixedExpense(Base):
    __tablename__ = "fixed_expenses"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), index=True)
    amount = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)

class MonthlyRecord(Base):
    __tablename__ = "monthly_records"
    id = Column(Integer, primary_key=True, index=True)
    year = Column(Integer, index=True)
    month = Column(Integer, index=True)
    current_balance = Column(Integer, default=0)
    
    items = relationship("MonthlyItem", back_populates="record", cascade="all, delete-orphan")

class MonthlyItem(Base):
    __tablename__ = "monthly_items"
    id = Column(Integer, primary_key=True, index=True)
    record_id = Column(Integer, ForeignKey("monthly_records.id"))
    name = Column(String(100))
    amount = Column(Integer, default=0)
    type = Column(String(20)) # "fixed_expense", "variable_expense", "income"
    is_imported_fixed = Column(Boolean, default=False)
    
    record = relationship("MonthlyRecord", back_populates="items")
