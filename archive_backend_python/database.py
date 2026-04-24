import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# .env.local 파일이 있으면 우선 로드 (로컬 개발 환경 구분)
if os.path.exists(".env.local"):
    load_dotenv(".env.local")
else:
    load_dotenv()

# .env에서 DATABASE_URL을 가져오며, 없을 경우 로컬 SQLite를 기본값으로 사용
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./mycount.db")

# SQLite인 경우에만 check_same_thread 인자를 사용 (MariaDB 연결 시 오류 방지)
connect_args = {"check_same_thread": False} if SQLALCHEMY_DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
