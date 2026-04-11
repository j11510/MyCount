from sqlalchemy.orm import Session
import models, schemas
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_admin_by_username(db: Session, username: str):
    return db.query(models.Admin).filter(models.Admin.username == username).first()

def create_admin(db: Session, admin: schemas.AdminCreate):
    hashed_password = pwd_context.hash(admin.password)
    db_admin = models.Admin(username=admin.username, hashed_password=hashed_password)
    db.add(db_admin)
    db.commit()
    db.refresh(db_admin)
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
