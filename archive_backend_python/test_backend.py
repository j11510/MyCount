import os
import sys
from datetime import date

# Add backend to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import crud, models, schemas, database
from sqlalchemy.orm import Session

def test_donation_crud():
    db = next(database.get_db())
    
    # 1. Create
    print("Testing Donation Creation...")
    new_donation = schemas.DonationRecordCreate(
        member_name="테스트 성도",
        amount=100000,
        date=date(2026, 4, 11)
    )
    db_record = crud.create_donation_record(db, new_donation)
    print(f"Created: {db_record.member_name}, {db_record.amount}, {db_record.date}")
    
    # 2. Read
    print("Testing Donation Read...")
    records = crud.get_donation_records(db, 2026, 4)
    found = any(r.id == db_record.id for r in records)
    print(f"Record found in list: {found}")
    
    # 3. Delete
    print("Testing Donation Deletion...")
    crud.delete_donation_record(db, db_record.id)
    records_after = crud.get_donation_records(db, 2026, 4)
    deleted = not any(r.id == db_record.id for r in records_after)
    print(f"Record deleted: {deleted}")
    
    if found and deleted:
        print("Backend CRUD Test PASSED!")
    else:
        print("Backend CRUD Test FAILED!")

if __name__ == "__main__":
    test_donation_crud()
