from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from datetime import timedelta
from typing import List

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
        data={"sub": admin.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/fixed-expenses", response_model=List[schemas.FixedExpenseResponse])
def read_fixed_expenses(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_fixed_expenses(db, skip=skip, limit=limit)

@app.post("/fixed-expenses", response_model=schemas.FixedExpenseResponse)
def create_fixed_expense(expense: schemas.FixedExpenseCreate, db: Session = Depends(get_db)):
    return crud.create_fixed_expense(db=db, expense=expense)

@app.delete("/fixed-expenses/{expense_id}")
def delete_fixed_expense(expense_id: int, db: Session = Depends(get_db)):
    crud.delete_fixed_expense(db, expense_id)
    return {"status": "deleted"}

@app.post("/monthly-records", response_model=schemas.MonthlyRecordResponse)
def create_monthly_record(record: schemas.MonthlyRecordCreate, db: Session = Depends(get_db)):
    db_record = crud.get_monthly_record_by_date(db, year=record.year, month=record.month)
    if db_record:
        raise HTTPException(status_code=400, detail="Record for this month already exists")
    return crud.create_monthly_record(db=db, record=record)

@app.get("/monthly-records", response_model=List[schemas.MonthlyRecordResponse])
def read_monthly_records(skip: int = 0, limit: int = 12, db: Session = Depends(get_db)):
    return crud.get_monthly_records(db, skip=skip, limit=limit)

@app.get("/monthly-records/{record_id}", response_model=schemas.MonthlyRecordResponse)
def read_monthly_record(record_id: int, db: Session = Depends(get_db)):
    db_record = crud.get_monthly_record(db, record_id=record_id)
    if db_record is None:
        raise HTTPException(status_code=404, detail="Record not found")
    return db_record

@app.put("/monthly-records/{record_id}/balance", response_model=schemas.MonthlyRecordResponse)
def update_balance(record_id: int, current_balance: int, db: Session = Depends(get_db)):
    return crud.update_monthly_record_balance(db, record_id, current_balance)

@app.delete("/monthly-records/{record_id}")
def delete_monthly_record(record_id: int, db: Session = Depends(get_db)):
    crud.delete_monthly_record(db, record_id)
    return {"status": "deleted"}

@app.post("/monthly-records/{record_id}/items", response_model=schemas.MonthlyItemResponse)
def create_item_for_record(record_id: int, item: schemas.MonthlyItemCreate, db: Session = Depends(get_db)):
    return crud.create_monthly_item(db=db, record_id=record_id, item=item)

@app.put("/monthly-items/{item_id}", response_model=schemas.MonthlyItemResponse)
def update_item_amount(item_id: int, amount: int, db: Session = Depends(get_db)):
    return crud.update_monthly_item(db=db, item_id=item_id, amount=amount)

@app.delete("/monthly-items/{item_id}")
def delete_item(item_id: int, db: Session = Depends(get_db)):
    crud.delete_monthly_item(db=db, item_id=item_id)
    return {"status": "deleted"}
