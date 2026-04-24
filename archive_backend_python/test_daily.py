import os
import sys
from datetime import date

# Add backend to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import crud, models, schemas, database
from sqlalchemy.orm import Session

def test_daily_summary():
    db = next(database.get_db())
    
    print("Testing Daily Grouping Logic...")
    
    # 1. Create multiple records for different dates
    d1 = schemas.DonationRecordCreate(member_name="A", amount=1000, date=date(2026, 4, 11))
    d2 = schemas.DonationRecordCreate(member_name="B", amount=2000, date=date(2026, 4, 11))
    d3 = schemas.DonationRecordCreate(member_name="C", amount=5000, date=date(2026, 4, 12))
    
    r1 = crud.create_donation_record(db, d1)
    r2 = crud.create_donation_record(db, d2)
    r3 = crud.create_donation_record(db, d3)
    
    # 2. Extract and Verify
    records = crud.get_donation_records(db, 2026, 4)
    
    # Manual Grouping (Simulating UI logic)
    grouped = {}
    for r in records:
        d = str(r.date)
        if d not in grouped: grouped[d] = 0
        grouped[d] += r.amount
    
    print(f"Grouped Totals: {grouped}")
    
    expected_11 = 3000 # Since we already have 1 from previous test + these 2
    # Wait, previous test deleted its record. So it should be 3000 for the 11th.
    
    success = grouped.get('2026-04-11') >= 3000 and grouped.get('2026-04-12') == 5000
    print(f"Daily totals verification: {success}")
    
    # Cleanup
    crud.delete_donation_record(db, r1.id)
    crud.delete_donation_record(db, r2.id)
    crud.delete_donation_record(db, r3.id)
    
    if success:
        print("Daily Grouping Test PASSED!")
    else:
        print("Daily Grouping Test FAILED!")

if __name__ == "__main__":
    test_daily_summary()
