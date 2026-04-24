
from sqlalchemy import create_engine, func
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv
import models

load_dotenv()
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./mycount.db")
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
db = SessionLocal()

def debug_balance(bank_account):
    print(f"--- Debugging Account: {bank_account} ---")
    account = db.query(models.AccountingAccount).filter(models.AccountingAccount.code == bank_account).first()
    if not account:
        print("Account not found")
        return
    
    print(f"Account Balance in DB: {account.balance}")
    
    total_income = db.query(func.sum(models.AccountingRecord.amount)).filter(
        models.AccountingRecord.bank_account == bank_account,
        models.AccountingRecord.type == 'income'
    ).scalar() or 0
    
    total_expense = db.query(func.sum(models.AccountingRecord.amount)).filter(
        models.AccountingRecord.bank_account == bank_account,
        models.AccountingRecord.type == 'expense'
    ).scalar() or 0
    
    print(f"Total Income (All time): {total_income}")
    print(f"Total Expense (All time): {total_expense}")
    print(f"Net Flow (All time): {total_income - total_expense}")
    print(f"Calculated Global Offset: {account.balance - (total_income - total_expense)}")
    
    records = db.query(models.AccountingRecord).filter(
        models.AccountingRecord.bank_account == bank_account
    ).order_by(models.AccountingRecord.date.asc(), models.AccountingRecord.id.asc()).all()
    
    print(f"Total Records found: {len(records)}")
    for r in records:
        print(f"ID: {r.id}, Date: {r.date}, Type: {r.type}, Amount: {r.amount}, Desc: {r.description}")

if __name__ == "__main__":
    # The user mentioned "찬조금 통장", which code is likely 'donations'
    debug_balance('donations')
    # Also check 'finances' just in case
    debug_balance('finances')
    db.close()
