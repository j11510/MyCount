from sqlalchemy.orm import Session
from typing import Optional
import models, schemas
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_admin_by_username(db: Session, username: str):
    return db.query(models.Admin).filter(models.Admin.username == username).first()

def create_admin(db: Session, admin: schemas.AdminCreate):
    hashed_password = pwd_context.hash(admin.password)
    db_admin = models.Admin(
        username=admin.username, 
        hashed_password=hashed_password,
        role=admin.role
    )
    db.add(db_admin)
    db.commit()
    db.refresh(db_admin)
    return db_admin

def get_admins(db: Session):
    return db.query(models.Admin).all()

def delete_admin(db: Session, admin_id: int):
    db_admin = db.query(models.Admin).filter(models.Admin.id == admin_id).first()
    if db_admin:
        db.delete(db_admin)
        db.commit()
    return db_admin

def get_fixed_expenses(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.FixedExpense).offset(skip).limit(limit).all()

def create_fixed_expense(db: Session, expense: schemas.FixedExpenseCreate):
    db_expense = models.FixedExpense(**expense.model_dump())
    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)
    return db_expense

def delete_fixed_expense(db: Session, expense_id: int):
    db_expense = db.query(models.FixedExpense).filter(models.FixedExpense.id == expense_id).first()
    if db_expense:
        db.delete(db_expense)
        db.commit()
    return db_expense

def get_monthly_records(db: Session, skip: int = 0, limit: int = 12):
    return db.query(models.MonthlyRecord).order_by(models.MonthlyRecord.year.desc(), models.MonthlyRecord.month.desc()).offset(skip).limit(limit).all()

def get_monthly_record(db: Session, record_id: int):
    return db.query(models.MonthlyRecord).filter(models.MonthlyRecord.id == record_id).first()

def get_monthly_record_by_date(db: Session, year: int, month: int):
    return db.query(models.MonthlyRecord).filter(models.MonthlyRecord.year == year, models.MonthlyRecord.month == month).first()

def create_monthly_record(db: Session, record: schemas.MonthlyRecordCreate):
    db_record = models.MonthlyRecord(**record.model_dump())
    db.add(db_record)
    
    # Auto import fixed expenses
    fixed_expenses = get_fixed_expenses(db)
    for fe in fixed_expenses:
        if fe.is_active:
            item = models.MonthlyItem(
                name=fe.name,
                amount=fe.amount,
                type="fixed_expense",
                is_imported_fixed=True
            )
            db_record.items.append(item)
            
    db.commit()
    db.refresh(db_record)
    return db_record

def update_monthly_record_balance(db: Session, record_id: int, current_balance: int):
    db_record = db.query(models.MonthlyRecord).filter(models.MonthlyRecord.id == record_id).first()
    if db_record:
        db_record.current_balance = current_balance
        db.commit()
        db.refresh(db_record)
    return db_record

def create_monthly_item(db: Session, record_id: int, item: schemas.MonthlyItemCreate):
    db_item = models.MonthlyItem(**item.model_dump(), record_id=record_id)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

def delete_monthly_item(db: Session, item_id: int):
    db_item = db.query(models.MonthlyItem).filter(models.MonthlyItem.id == item_id).first()
    if db_item:
        db.delete(db_item)
        db.commit()
    return db_item

def update_monthly_item(db: Session, item_id: int, amount: int):
    db_item = db.query(models.MonthlyItem).filter(models.MonthlyItem.id == item_id).first()
    if db_item:
        db_item.amount = amount
        db.commit()
        db.refresh(db_item)
    return db_item

def delete_monthly_record(db: Session, record_id: int):
    db_record = db.query(models.MonthlyRecord).filter(models.MonthlyRecord.id == record_id).first()
    if db_record:
        db.delete(db_record)
        db.commit()
    return db_record

# Accounting Category CRUD
def get_accounting_categories(db: Session, type: Optional[str] = None):
    query = db.query(models.AccountingCategory)
    if type:
        query = query.filter(models.AccountingCategory.type == type)
    return query.all()

def create_accounting_category(db: Session, category: schemas.AccountingCategoryCreate):
    db_category = models.AccountingCategory(**category.dict())
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

def delete_accounting_category(db: Session, category_id: int):
    db_category = db.query(models.AccountingCategory).filter(models.AccountingCategory.id == category_id).first()
    if db_category:
        db.delete(db_category)
        db.commit()
    return db_category

# Accounting Record CRUD
def get_accounting_records(db: Session, year: int = None, month: int = None, bank_account: str = None):
    from sqlalchemy import extract, func
    query = db.query(models.AccountingRecord)
    if year:
        query = query.filter(extract('year', models.AccountingRecord.date) == year)
    if month:
        query = query.filter(extract('month', models.AccountingRecord.date) == month)
    if bank_account:
        query = query.filter(models.AccountingRecord.bank_account == bank_account)
    
    # Sort by date and id to ensure deterministic running balance
    records = query.order_by(models.AccountingRecord.date.asc(), models.AccountingRecord.id.asc()).all()
    
    if bank_account and year and month:
        # 1. Get the monthly manual opening balance
        db_monthly_bal = get_monthly_opening_balance(db, bank_account, year, month)
        running_bal = db_monthly_bal.opening_balance if db_monthly_bal else 0
        
        for r in records:
            if r.type == 'income':
                running_bal += r.amount
            else:
                running_bal -= r.amount
            r.running_balance = running_bal
            
    # Return in registration order (asc) as requested
    return records

def create_accounting_record(db: Session, record: schemas.AccountingRecordCreate):
    db_record = models.AccountingRecord(**record.dict())
    db.add(db_record)
    
    # Update account balance using the record type
    db_account = db.query(models.AccountingAccount).filter(models.AccountingAccount.code == record.bank_account).first()
    if db_account:
        if record.type == "income":
            db_account.balance += record.amount
        else:
            db_account.balance -= record.amount
                
    db.commit()
    db.refresh(db_record)
    return db_record

def delete_accounting_record(db: Session, record_id: int):
    db_record = db.query(models.AccountingRecord).filter(models.AccountingRecord.id == record_id).first()
    if db_record:
        # Revert account balance using the record type
        db_account = db.query(models.AccountingAccount).filter(models.AccountingAccount.code == db_record.bank_account).first()
        if db_account:
            if db_record.type == "income":
                db_account.balance -= db_record.amount
            else:
                db_account.balance += db_record.amount
        
        db.delete(db_record)
        db.commit()
    return db_record

def update_accounting_record(db: Session, record_id: int, record: schemas.AccountingRecordCreate):
    db_record = db.query(models.AccountingRecord).filter(models.AccountingRecord.id == record_id).first()
    if db_record:
        # 1. Revert old balance
        db_account = db.query(models.AccountingAccount).filter(models.AccountingAccount.code == db_record.bank_account).first()
        if db_account:
            if db_record.type == "income":
                db_account.balance -= db_record.amount
            else:
                db_account.balance += db_record.amount
        
        # 2. Update record
        for key, value in record.model_dump().items():
            setattr(db_record, key, value)
            
        # 3. Apply new balance (might be different account too)
        new_account = db.query(models.AccountingAccount).filter(models.AccountingAccount.code == record.bank_account).first()
        if new_account:
            if record.type == "income":
                new_account.balance += record.amount
            else:
                new_account.balance -= record.amount
                
        db.commit()
        db.refresh(db_record)
    return db_record

def update_accounting_record_status(db: Session, record_id: int, is_processed: bool):
    db_record = db.query(models.AccountingRecord).filter(models.AccountingRecord.id == record_id).first()
    if db_record:
        db_record.is_processed = is_processed
        db.commit()
        db.refresh(db_record)
    return db_record

# Accounting Account CRUD
def get_accounting_accounts(db: Session):
    return db.query(models.AccountingAccount).all()

def get_accounting_account_by_code(db: Session, code: str):
    return db.query(models.AccountingAccount).filter(models.AccountingAccount.code == code).first()

def update_accounting_account_balance(db: Session, code: str, new_balance: int):
    db_account = db.query(models.AccountingAccount).filter(models.AccountingAccount.code == code).first()
    if db_account:
        db_account.balance = new_balance
        db.commit()
        db.refresh(db_account)
    return db_account

def update_initial_balance(db: Session, code: str, initial_balance: int):
    from sqlalchemy import func
    db_account = db.query(models.AccountingAccount).filter(models.AccountingAccount.code == code).first()
    if db_account:
        db_account.initial_balance = initial_balance
        # Also recalculate current balance
        total_income = db.query(func.sum(models.AccountingRecord.amount)).filter(
            models.AccountingRecord.bank_account == code,
            models.AccountingRecord.type == 'income'
        ).scalar() or 0
        total_expense = db.query(func.sum(models.AccountingRecord.amount)).filter(
            models.AccountingRecord.bank_account == code,
            models.AccountingRecord.type == 'expense'
        ).scalar() or 0
        db_account.balance = initial_balance + total_income - total_expense
        db.commit()
        db.refresh(db_account)
    return db_account

def get_accounting_stats(db: Session, year: int, month: int):
    from sqlalchemy import func, extract
    # 1. Monthly totals from AccountingRecord
    ledger_stats = db.query(
        models.AccountingRecord.bank_account,
        models.AccountingCategory.name.label("category_name"),
        models.AccountingRecord.type,
        func.sum(models.AccountingRecord.amount).label("total_amount")
    ).join(models.AccountingCategory).filter(
        extract('year', models.AccountingRecord.date) == year,
        extract('month', models.AccountingRecord.date) == month
    ).group_by(
        models.AccountingRecord.bank_account,
        models.AccountingCategory.name,
        models.AccountingRecord.type
    ).all()
    
    result = [list(s) for s in ledger_stats]
    
    return result

def get_account_running_balance(db: Session, bank_account: str, year: int, month: int):
    from sqlalchemy import func
    from datetime import date
    import calendar
    
    # Get the last day of the target month
    last_day = calendar.monthrange(year, month)[1]
    target_date = date(year, month, last_day)
    
    # 1. Get initial starting balance of the account (the anchor)
    db_account = db.query(models.AccountingAccount).filter(models.AccountingAccount.code == bank_account).first()
    anchor_bal = db_account.initial_balance if db_account else 0
    
    # 2. Sum of all transactions UP TO the target date
    income_sum = db.query(func.sum(models.AccountingRecord.amount)).filter(
        models.AccountingRecord.bank_account == bank_account,
        models.AccountingRecord.type == 'income',
        models.AccountingRecord.date <= target_date
    ).scalar() or 0
    
    expense_sum = db.query(func.sum(models.AccountingRecord.amount)).filter(
        models.AccountingRecord.bank_account == bank_account,
        models.AccountingRecord.type == 'expense',
        models.AccountingRecord.date <= target_date
    ).scalar() or 0
    
    # Balance = Anchor + Income - Expense
    return anchor_bal + income_sum - expense_sum

# Donation Record CRUD
def get_donation_records(db: Session, year: int, month: int):
    from sqlalchemy import extract
    return db.query(models.DonationRecord).filter(
        extract('year', models.DonationRecord.date) == year,
        extract('month', models.DonationRecord.date) == month
    ).order_by(models.DonationRecord.date.desc()).all()

def create_donation_record(db: Session, record: schemas.DonationRecordCreate):
    db_record = models.DonationRecord(**record.model_dump())
    db.add(db_record)
    db.commit()
    db.refresh(db_record)
    return db_record

def delete_donation_record(db: Session, record_id: int):
    db_record = db.query(models.DonationRecord).filter(models.DonationRecord.id == record_id).first()
    if db_record:
        db.delete(db_record)
        db.commit()
    return db_record

def update_donation_record(db: Session, record_id: int, record: schemas.DonationRecordCreate):
    db_record = db.query(models.DonationRecord).filter(models.DonationRecord.id == record_id).first()
    if db_record:
        for key, value in record.model_dump().items():
            setattr(db_record, key, value)
        db.commit()
        db.refresh(db_record)
    return db_record

def get_unique_donors(db: Session):
    from sqlalchemy import func
    return db.query(models.DonationRecord.member_name).distinct().all()

# Monthly Report CRUD
def get_monthly_report(db: Session, year: int, month: int):
    return db.query(models.MonthlyReport).filter(
        models.MonthlyReport.year == year,
        models.MonthlyReport.month == month
    ).first()

def upsert_monthly_report(db: Session, report: schemas.MonthlyReportCreate):
    db_report = db.query(models.MonthlyReport).filter(
        models.MonthlyReport.year == report.year,
        models.MonthlyReport.month == report.month
    ).first()
    
    if db_report:
        for key, value in report.model_dump().items():
            setattr(db_report, key, value)
    else:
        db_report = models.MonthlyReport(**report.model_dump())
        db.add(db_report)
    
    db.commit()
    db.refresh(db_report)
    return db_report

# Infant Expense (from AccountingRecord)
def get_infant_expenses_from_ledger(db: Session, year: int, month: int, bank_account: str = None):
    from sqlalchemy import extract
    query = db.query(models.AccountingRecord).filter(
        extract('year', models.AccountingRecord.date) == year,
        extract('month', models.AccountingRecord.date) == month
    )
    if bank_account:
        query = query.filter(models.AccountingRecord.bank_account == bank_account)
    
    return query.order_by(models.AccountingRecord.date.asc()).all()

def create_infant_expense(db: Session, expense: schemas.InfantExpenseCreate):
    db_expense = models.InfantExpense(**expense.model_dump())
    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)
    return db_expense

def update_infant_expense(db: Session, expense_id: int, expense: schemas.InfantExpenseCreate):
    db_expense = db.query(models.InfantExpense).filter(models.InfantExpense.id == expense_id).first()
    if db_expense:
        for key, value in expense.model_dump().items():
            setattr(db_expense, key, value)
        db.commit()
        db.refresh(db_expense)
    return db_expense

def delete_infant_expense(db: Session, expense_id: int):
    db_expense = db.query(models.InfantExpense).filter(models.InfantExpense.id == expense_id).first()
    if db_expense:
        db.delete(db_expense)
        db.commit()
    return db_expense

def get_monthly_opening_balance(db: Session, bank_account: str, year: int, month: int):
    return db.query(models.AccountingMonthlyBalance).filter(
        models.AccountingMonthlyBalance.bank_account == bank_account,
        models.AccountingMonthlyBalance.year == year,
        models.AccountingMonthlyBalance.month == month
    ).first()

def update_monthly_opening_balance(db: Session, bank_account: str, year: int, month: int, opening_balance: int):
    db_bal = get_monthly_opening_balance(db, bank_account, year, month)
    if db_bal:
        db_bal.opening_balance = opening_balance
    else:
        db_bal = models.AccountingMonthlyBalance(
            bank_account=bank_account,
            year=year,
            month=month,
            opening_balance=opening_balance
        )
        db.add(db_bal)
    db.commit()
    db.refresh(db_bal)
    return db_bal

