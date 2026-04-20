from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Date, DateTime
from datetime import datetime
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

class AccountingCategory(Base):
    __tablename__ = "accounting_categories"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), index=True)
    type = Column(String(20)) # "income", "expense"

class AccountingRecord(Base):
    __tablename__ = "accounting_records"
    id = Column(Integer, primary_key=True, index=True)
    bank_account = Column(String(50), index=True) # "finances", "donations", "meeting"
    category_id = Column(Integer, ForeignKey("accounting_categories.id"))
    description = Column(String(255))
    amount = Column(Integer, default=0)
    type = Column(String(20)) # "income", "expense"
    remarks = Column(String(500), nullable=True)
    date = Column(Date, index=True)
    
    category = relationship("AccountingCategory")

class AccountingAccount(Base):
    __tablename__ = "accounting_accounts"
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, index=True) # "finances", "donations", "meeting"
    display_name = Column(String(100))
    balance = Column(Integer, default=0)

class DonationRecord(Base):
    __tablename__ = "donation_records"
    id = Column(Integer, primary_key=True, index=True)
    member_name = Column(String(100), index=True)
    amount = Column(Integer, default=0)
    note = Column(String(255), nullable=True)
    date = Column(Date, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class InfantExpense(Base):
    __tablename__ = "infant_expenses"
    id = Column(Integer, primary_key=True, index=True)
    year = Column(Integer, index=True)
    month = Column(Integer, index=True)
    parent_no = Column(String(10), index=True) # e.g., "1", "2"
    child_no = Column(String(10), nullable=True) # e.g., "1-1", "1-2"
    description = Column(String(255))
    amount = Column(Integer, default=0) # Parent amount or child amount
    payment_method = Column(String(50), nullable=True)
    remarks = Column(String(255), nullable=True)
    is_child = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
class MonthlyReport(Base):
    __tablename__ = "monthly_reports"
    id = Column(Integer, primary_key=True, index=True)
    year = Column(Integer, index=True)
    month = Column(Integer, index=True)
    reporter = Column(String(50))
    plan_data = Column(String(2000)) # JSON string for next month's plans
    attendance_data = Column(String(2000)) # JSON string for attendance stats
    remarks = Column(String(500))
    created_at = Column(DateTime, default=datetime.now)
