from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from datetime import timedelta
from typing import List, Optional

import models, schemas, crud, auth
from database import engine, get_db

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="MyCount API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins for dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/token", response_model=schemas.Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    admin = auth.authenticate_admin(db, form_data.username, form_data.password)
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": admin.username, "role": admin.role}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users", response_model=List[schemas.AdminResponse])
def read_users(db: Session = Depends(get_db), current_user: models.Admin = Depends(auth.check_admin)):
    return crud.get_admins(db)

@app.get("/me", response_model=schemas.AdminResponse)
def read_me(current_user: models.Admin = Depends(auth.get_current_user)):
    return current_user

@app.post("/users", response_model=schemas.AdminResponse)
def create_user(user: schemas.AdminCreate, db: Session = Depends(get_db), current_user: models.Admin = Depends(auth.check_admin)):
    db_user = crud.get_admin_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    return crud.create_admin(db=db, admin=user)

@app.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db), current_user: models.Admin = Depends(auth.check_admin)):
    # Prevent self-deletion
    if current_user.id == user_id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    crud.delete_admin(db, user_id)
    return {"status": "deleted"}

@app.get("/fixed-expenses", response_model=List[schemas.FixedExpenseResponse])
def read_fixed_expenses(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: models.Admin = Depends(auth.check_admin)):
    return crud.get_fixed_expenses(db, skip=skip, limit=limit)

@app.post("/fixed-expenses", response_model=schemas.FixedExpenseResponse)
def create_fixed_expense(expense: schemas.FixedExpenseCreate, db: Session = Depends(get_db), current_user: models.Admin = Depends(auth.check_admin)):
    return crud.create_fixed_expense(db=db, expense=expense)

@app.delete("/fixed-expenses/{expense_id}")
def delete_fixed_expense(expense_id: int, db: Session = Depends(get_db), current_user: models.Admin = Depends(auth.check_admin)):
    crud.delete_fixed_expense(db, expense_id)
    return {"status": "deleted"}

@app.post("/monthly-records", response_model=schemas.MonthlyRecordResponse)
def create_monthly_record(record: schemas.MonthlyRecordCreate, db: Session = Depends(get_db), current_user: models.Admin = Depends(auth.check_admin)):
    db_record = crud.get_monthly_record_by_date(db, year=record.year, month=record.month)
    if db_record:
        raise HTTPException(status_code=400, detail="Record for this month already exists")
    return crud.create_monthly_record(db=db, record=record)

@app.get("/monthly-records", response_model=List[schemas.MonthlyRecordResponse])
def read_monthly_records(skip: int = 0, limit: int = 12, db: Session = Depends(get_db), current_user: models.Admin = Depends(auth.check_admin)):
    return crud.get_monthly_records(db, skip=skip, limit=limit)

@app.get("/monthly-records/{record_id}", response_model=schemas.MonthlyRecordResponse)
def read_monthly_record(record_id: int, db: Session = Depends(get_db), current_user: models.Admin = Depends(auth.check_admin)):
    db_record = crud.get_monthly_record(db, record_id=record_id)
    if db_record is None:
        raise HTTPException(status_code=404, detail="Record not found")
    return db_record

@app.put("/monthly-records/{record_id}/balance", response_model=schemas.MonthlyRecordResponse)
def update_balance(record_id: int, current_balance: int, db: Session = Depends(get_db), current_user: models.Admin = Depends(auth.check_admin)):
    return crud.update_monthly_record_balance(db, record_id, current_balance)

@app.delete("/monthly-records/{record_id}")
def delete_monthly_record(record_id: int, db: Session = Depends(get_db), current_user: models.Admin = Depends(auth.check_admin)):
    crud.delete_monthly_record(db, record_id)
    return {"status": "deleted"}

@app.post("/monthly-records/{record_id}/items", response_model=schemas.MonthlyItemResponse)
def create_item_for_record(record_id: int, item: schemas.MonthlyItemCreate, db: Session = Depends(get_db), current_user: models.Admin = Depends(auth.check_admin)):
    return crud.create_monthly_item(db=db, record_id=record_id, item=item)

@app.put("/monthly-items/{item_id}", response_model=schemas.MonthlyItemResponse)
def update_item_amount(item_id: int, amount: int, db: Session = Depends(get_db), current_user: models.Admin = Depends(auth.check_admin)):
    return crud.update_monthly_item(db=db, item_id=item_id, amount=amount)

@app.delete("/monthly-items/{item_id}")
def delete_item(item_id: int, db: Session = Depends(get_db), current_user: models.Admin = Depends(auth.check_admin)):
    crud.delete_monthly_item(db=db, item_id=item_id)
    return {"status": "deleted"}

# Accounting Modules
@app.get("/accounting/categories", response_model=List[schemas.AccountingCategoryResponse])
def read_accounting_categories(type: Optional[str] = None, db: Session = Depends(get_db), current_user: models.Admin = Depends(auth.check_manager)):
    return crud.get_accounting_categories(db, type=type)

@app.post("/accounting/categories", response_model=schemas.AccountingCategoryResponse)
def create_accounting_category(category: schemas.AccountingCategoryCreate, db: Session = Depends(get_db), current_user: models.Admin = Depends(auth.check_manager)):
    return crud.create_accounting_category(db, category)

@app.delete("/accounting/categories/{category_id}")
def delete_accounting_category(category_id: int, db: Session = Depends(get_db), current_user: models.Admin = Depends(auth.check_manager)):
    crud.delete_accounting_category(db, category_id)
    return {"status": "deleted"}

@app.get("/accounting/transactions/{bank_account}", response_model=List[schemas.AccountingRecordResponse])
def read_accounting_transactions(bank_account: str, year: int, month: int, db: Session = Depends(get_db), current_user: models.Admin = Depends(auth.check_manager)):
    return crud.get_accounting_records(db, bank_account, year, month)

@app.post("/accounting/transactions", response_model=schemas.AccountingRecordResponse)
def create_accounting_transaction(record: schemas.AccountingRecordCreate, db: Session = Depends(get_db), current_user: models.Admin = Depends(auth.check_manager)):
    return crud.create_accounting_record(db, record)

@app.delete("/accounting/transactions/{record_id}")
def delete_accounting_transaction(record_id: int, db: Session = Depends(get_db), current_user: models.Admin = Depends(auth.check_manager)):
    crud.delete_accounting_record(db, record_id)
    return {"status": "deleted"}

@app.get("/accounting/stats")
def read_accounting_stats(year: int, month: int, db: Session = Depends(get_db), current_user: models.Admin = Depends(auth.check_manager)):
    stats = crud.get_accounting_stats(db, year, month)
    result = []
    for s in stats:
        result.append({
            "bank_account": s[0],
            "category_name": s[1],
            "type": s[2],
            "amount": s[3]
        })
    return result

@app.get("/accounting/accounts", response_model=List[schemas.AccountingAccountResponse])
def read_accounting_accounts(db: Session = Depends(get_db), current_user: models.Admin = Depends(auth.check_manager)):
    return crud.get_accounting_accounts(db)

@app.put("/accounting/accounts/{code}/balance", response_model=schemas.AccountingAccountResponse)
def update_account_balance(code: str, balance: int, db: Session = Depends(get_db), current_user: models.Admin = Depends(auth.check_manager)):
    return crud.update_accounting_account_balance(db, code, balance)
@app.get("/donations", response_model=List[schemas.DonationRecordResponse])
def read_donations(year: int, month: int, db: Session = Depends(get_db), current_user: models.Admin = Depends(auth.check_manager)):
    return crud.get_donation_records(db, year, month)

@app.post("/donations", response_model=schemas.DonationRecordResponse)
def create_donation(record: schemas.DonationRecordCreate, db: Session = Depends(get_db), current_user: models.Admin = Depends(auth.check_manager)):
    return crud.create_donation_record(db, record)

@app.delete("/donations/{record_id}")
def delete_donation(record_id: int, db: Session = Depends(get_db), current_user: models.Admin = Depends(auth.check_manager)):
    return crud.delete_donation_record(db, record_id)

@app.get("/donations/export")
def export_donations(year: int, month: int, db: Session = Depends(get_db), current_user: models.Admin = Depends(auth.check_manager)):
    import pandas as pd
    from io import BytesIO
    from fastapi.responses import StreamingResponse
    
    records = crud.get_donation_records(db, year, month)
    data = []
    total = 0
    # Grouping for Excel
    current_date = None
    day_total = 0
    for r in records:
        # If date changed, append subtotal for previous date
        if current_date and r.date != current_date:
            data.append({"날짜": f"{current_date} 소계", "성함": "-", "금액": day_total})
            day_total = 0
        
        data.append({
            "날짜": r.date,
            "성함": r.member_name,
            "금액": r.amount
        })
        current_date = r.date
        day_total += r.amount
        total += r.amount
    
    # Append last date subtotal
    if current_date:
        data.append({"날짜": f"{current_date} 소계", "성함": "-", "금액": day_total})
        
    if data:
        data.append({"날짜": "월 합계", "성함": "", "금액": total})

        
    df = pd.DataFrame(data)
    output = BytesIO()
    with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
        df.to_excel(writer, index=False, sheet_name='헌금내역')
    output.seek(0)
    
    headers = {
        'Content-Disposition': f'attachment; filename="donation_{year}_{month}.xlsx"'
    }
    return StreamingResponse(output, headers=headers, media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
