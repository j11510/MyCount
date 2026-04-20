from sqlalchemy import text
from database import engine

def verify():
    tables = [
        "admins",
        "accounting_categories",
        "accounting_accounts",
        "fixed_expenses",
        "monthly_records",
        "monthly_items",
        "accounting_records",
        "donation_records",
    ]
    
    with engine.connect() as conn:
        print("--- Table Row Counts ---")
        for table in tables:
            try:
                result = conn.execute(text(f"SELECT COUNT(*) FROM {table}"))
                count = result.scalar()
                print(f"{table:25}: {count} rows")
            except Exception as e:
                print(f"{table:25}: Failed to query ({e})")
        print("------------------------")

if __name__ == "__main__":
    verify()
