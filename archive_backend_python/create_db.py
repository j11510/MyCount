import pymysql
import os
from dotenv import load_dotenv

load_dotenv()

# .env에서 정보를 가져와서 DB 생성
# mysql+pymysql://root:admin1234@127.0.0.1:3306/chdb
db_url = os.getenv("DATABASE_URL")
if not db_url:
    print("DATABASE_URL not found in .env")
    exit(1)

# URL 파싱 (간단하게)
# mysql+pymysql://root:admin1234@127.0.0.1:3306/chdb
try:
    # 프로토콜 제거
    parts = db_url.split("://")[1]
    # 인증 정보와 호스트/포트/DB 분리
    auth, rest = parts.split("@")
    user, password = auth.split(":")
    host_port, db_name = rest.split("/")
    host, port = host_port.split(":")
    port = int(port)
except Exception as e:
    print(f"Failed to parse DATABASE_URL: {e}")
    exit(1)

try:
    # 서버에 연결 (DB 지정 없이)
    connection = pymysql.connect(
        host=host,
        user=user,
        password=password,
        port=port
    )
    with connection.cursor() as cursor:
        # DB 생성
        sql = f"CREATE DATABASE IF NOT EXISTS {db_name} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
        cursor.execute(sql)
        print(f"Database '{db_name}' created or already exists.")
    connection.close()
except Exception as e:
    print(f"Error creating database: {e}")
