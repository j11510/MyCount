import models, schemas, crud, database
from database import SessionLocal

def init():
    try:
        models.Base.metadata.create_all(bind=database.engine)
        db = SessionLocal()
        admin = crud.get_admin_by_username(db, "admin")
        if not admin:
            crud.create_admin(db, schemas.AdminCreate(username="admin", password="admin123"))
            print("Successfully created default admin: admin / admin123")
        else:
            print("Admin already exists.")
        db.close()
    except Exception as e:
        print(f"Error initializing DB: {e}")

if __name__ == "__main__":
    init()
