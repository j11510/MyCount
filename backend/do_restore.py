import os
import glob
import pandas as pd
from sqlalchemy import text
import models, database
from database import engine

def get_latest_csv(folder, prefix):
    files = glob.glob(os.path.join(folder, f"{prefix}_*.csv"))
    if not files:
        return None
    return sorted(files)[-1]

def restore():
    print("Creating tables...")
    # 1. Create tables
    models.Base.metadata.create_all(bind=engine)
    print("Tables created.")

    # 2. Iterate and insert
    backup_folder = r"d:\PythonProject\mycount\backup"
    
    table_prefixes = [
        ("admins", "admins"),
        ("accounting_categories", "accounting_categories"),
        ("accounting_accounts", "accounting_accounts"),
        ("fixed_expenses", "fixed_expenses"),
        ("monthly_records", "monthly_records"),
        ("monthly_items", "monthly_items"),
        ("accounting_records", "accounting_records"),
        ("donation_records", "donation_records"),
    ]

    for table_name, prefix in table_prefixes:
        csv_file = get_latest_csv(backup_folder, prefix)
        if csv_file:
            try:
                df = pd.read_csv(csv_file)
                # Ensure we don't insert duplicate IDs if they exist. For a fresh DB, it should be fine.
                # But in postgres, we should also reset sequences if we insert explicit IDs.
                df.to_sql(table_name, con=engine, if_exists='append', index=False)
                print(f"Restored {len(df)} rows to table {table_name} from {os.path.basename(csv_file)}")
                
                # Reset sequence for postgresql
                with engine.begin() as conn:
                    # In PostgreSQL, check if dialect is postgresql to reset sequence
                    if engine.dialect.name == "postgresql":
                        conn.execute(text(f"SELECT setval('{table_name}_id_seq', (SELECT MAX(id) FROM {table_name}) + 1);"))
            except Exception as e:
                print(f"Failed to restore {table_name}: {e}")
        else:
            print(f"No backup found for {table_name}")

if __name__ == "__main__":
    restore()
