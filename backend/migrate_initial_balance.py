
import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./mycount.db")
engine = create_engine(SQLALCHEMY_DATABASE_URL)

def run_migration():
    with engine.connect() as conn:
        print("Adding initial_balance column...")
        try:
            conn.execute(text("ALTER TABLE accounting_accounts ADD COLUMN initial_balance INTEGER DEFAULT 0"))
            print("Column added successfully.")
        except Exception as e:
            print(f"Error adding column (maybe exists?): {e}")
        
        print("Backfilling initial_balance from current balance...")
        conn.execute(text("UPDATE accounting_accounts SET initial_balance = balance"))
        conn.commit()
        print("Migration complete.")

if __name__ == "__main__":
    run_migration()
