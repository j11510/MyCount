import models, schemas, crud, database
from database import SessionLocal

def init():
    try:
        models.Base.metadata.create_all(bind=database.engine)
        db = SessionLocal()
        # 1. Admin Account
        admin = crud.get_admin_by_username(db, "admin")
        if not admin:
            crud.create_admin(db, schemas.AdminCreate(username="admin", password="admin1234", role="admin"))
            print("Successfully created default admin: admin / admin1234")
        else:
            print("Admin already exists.")
            
        # 2. Accounting Accounts
        accounts = [
            ("finances", "재정 통장"),
            ("donations", "헌금 통장"),
            ("meeting", "공회 통장")
        ]
        for code, name in accounts:
            acc = crud.get_accounting_account_by_code(db, code)
            if not acc:
                db_acc = models.AccountingAccount(code=code, display_name=name, balance=0)
                db.add(db_acc)
                print(f"Created accounting account: {name} ({code})")
        
        # 3. Default Accounting Categories
        default_categories = [
            ("식비", "expense"),
            ("간식비", "expense"),
            ("행사비", "expense"),
            ("물품구입", "expense"),
            ("십일조", "income"),
            ("감사헌금", "income"),
            ("기타수입", "income")
        ]
        existing_cats = [c.name for c in crud.get_accounting_categories(db)]
        for name, cat_type in default_categories:
            if name not in existing_cats:
                db_cat = models.AccountingCategory(name=name, type=cat_type)
                db.add(db_cat)
                print(f"Created default category: {name}")
                
        db.commit()
        db.close()
    except Exception as e:
        print(f"Error initializing DB: {e}")

if __name__ == "__main__":
    init()
