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
    type: str # Added type
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
    date: date

class DonationRecordCreate(DonationRecordBase):
    pass

class DonationRecordResponse(DonationRecordBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True
