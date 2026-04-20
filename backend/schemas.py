from pydantic import BaseModel
from typing import List, Optional

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class AdminBase(BaseModel):
    username: str
    role: str = "user"

class AdminCreate(AdminBase):
    password: str

class AdminResponse(AdminBase):
    id: int
    class Config:
        from_attributes = True

class FixedExpenseBase(BaseModel):
    name: str
    amount: int
    is_active: bool = True

class FixedExpenseCreate(FixedExpenseBase):
    pass

class FixedExpenseResponse(FixedExpenseBase):
    id: int
    class Config:
        from_attributes = True

class MonthlyItemBase(BaseModel):
    name: str
    amount: int
    type: str # "fixed_expense", "variable_expense", "income"
    is_imported_fixed: bool = False

class MonthlyItemCreate(MonthlyItemBase):
    pass

class MonthlyItemResponse(MonthlyItemBase):
    id: int
    record_id: int
    class Config:
        from_attributes = True

class MonthlyRecordBase(BaseModel):
    year: int
    month: int
    current_balance: int = 0

class MonthlyRecordCreate(MonthlyRecordBase):
    pass

class MonthlyRecordResponse(MonthlyRecordBase):
    id: int
    items: List[MonthlyItemResponse] = []
    class Config:
        from_attributes = True

from datetime import date, datetime

class AccountingCategoryBase(BaseModel):
    name: str
    type: Optional[str] = "general" # Now optional

class AccountingCategoryCreate(AccountingCategoryBase):
    pass

class AccountingCategoryResponse(AccountingCategoryBase):
    id: int
    class Config:
        from_attributes = True

class AccountingRecordBase(BaseModel):
    bank_account: str
    category_id: int
    description: str
    amount: int
    type: str
    remarks: Optional[str] = None
    date: date

class AccountingRecordCreate(AccountingRecordBase):
    pass

class AccountingRecordResponse(AccountingRecordBase):
    id: int
    category: Optional[AccountingCategoryResponse] = None
    class Config:
        from_attributes = True

class AccountingAccountBase(BaseModel):
    code: str
    display_name: str
    balance: int

class AccountingAccountCreate(AccountingAccountBase):
    pass

class AccountingAccountResponse(AccountingAccountBase):
    id: int
    class Config:
        from_attributes = True

class DonationRecordBase(BaseModel):
    member_name: str
    amount: int
    note: Optional[str] = None
    date: date

class DonationRecordCreate(DonationRecordBase):
    pass

class DonationRecordResponse(DonationRecordBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

class InfantExpenseBase(BaseModel):
    year: int
    month: int
    parent_no: str
    child_no: Optional[str] = None
    description: str
    amount: int
    payment_method: Optional[str] = None
    remarks: Optional[str] = None
    is_child: bool = False

class InfantExpenseCreate(InfantExpenseBase):
    pass

class InfantExpenseResponse(InfantExpenseBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True
class MonthlyReportBase(BaseModel):
    year: int
    month: int
    reporter: Optional[str] = None
    plan_data: Optional[str] = None
    attendance_data: Optional[str] = None
    remarks: Optional[str] = None

class MonthlyReportCreate(MonthlyReportBase):
    pass

class MonthlyReportResponse(MonthlyReportBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True
