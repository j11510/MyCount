import os
import glob
from sqlalchemy import text
from database import engine

def run_sql_files():
    backup_folder = r"d:\PythonProject\mycount\backup"
    
    # 순서가 중요할 수 있음 (외래 키 등)
    # 1. admins
    # 2. accounting_categories
    # 3. accounting_accounts
    # 4. fixed_expenses
    # 5. monthly_records
    # 6. monthly_items
    # 7. accounting_records
    # 8. donation_records
    
    order = [
        "admins",
        "accounting_categories",
        "accounting_accounts",
        "fixed_expenses",
        "monthly_records",
        "monthly_items",
        "accounting_records",
        "donation_records",
    ]
    
    with engine.begin() as conn:
        print("Disabling foreign key checks (optional, to avoid issues during bulk insert)...")
        if engine.dialect.name == "mysql":
            conn.execute(text("SET FOREIGN_KEY_CHECKS = 0;"))
        
        for prefix in order:
            # 해당 접두어로 시작하는 .sql 파일 찾기
            files = glob.glob(os.path.join(backup_folder, f"{prefix}_*.sql"))
            if not files:
                print(f"No .sql file found for {prefix}")
                continue
            
            # 가장 최신 파일 (이름순 정렬 시 마지막)
            sql_file = sorted(files)[-1]
            print(f"Executing {os.path.basename(sql_file)}...")
            
            with open(sql_file, 'r', encoding='utf-8') as f:
                content = f.read()
                # 여러 문장이 있을 수 있으므로 세미콜론으로 분리하여 실행 시도
                # 하지만 간단하게 파일 전체를 실행 (대부분의 드라이버는 지원하거나 세미콜론이 한두개임)
                for statement in content.split(';'):
                    stmt = statement.strip()
                    if stmt:
                        try:
                            conn.execute(text(stmt))
                        except Exception as e:
                            print(f"Error executing statement in {prefix}: {e}")
        
        if engine.dialect.name == "mysql":
            conn.execute(text("SET FOREIGN_KEY_CHECKS = 1;"))
            print("Foreign key checks re-enabled.")

    print("SQL Restoration completed.")

if __name__ == "__main__":
    run_sql_files()
