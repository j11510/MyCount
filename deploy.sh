#!/bin/bash

# MyCount Deployment Script for Termux (Ubuntu proot)

echo "=========================================="
echo " Starting MyCount Update & Deployment"
echo "=========================================="

# 1. 소스 코드 동기화
echo "[1/4] Pulling latest code from GitHub..."
git pull origin main

# 태블릿 IP 자동 감지
TABLET_IP=$(hostname -I | awk '{print $1}')
echo "Detected Tablet IP: $TABLET_IP"

# 1.5 DB 서비스 확인 (Termux proot 호환성)
echo "[1.5/4] Checking MariaDB service..."
# 서비스 명칭 후보군 (mysql, mariadb)
DB_SERVICE="mysql"
if ! service $DB_SERVICE status > /dev/null 2>&1; then
  DB_SERVICE="mariadb"
fi

if service $DB_SERVICE status > /dev/null 2>&1; then
  echo "MariaDB ($DB_SERVICE) is already running."
else
  echo "Starting MariaDB ($DB_SERVICE) service..."
  service $DB_SERVICE start || echo "Warning: Could not start MariaDB automatically. Please run 'service $DB_SERVICE start' manually."
fi

# 2. 백엔드 업데이트
echo "[2/4] Updating Backend dependencies (using Virtual Env)..."
cd backend
# 가상환경 생성 및 활성화
if [ ! -d "venv" ]; then
  python3 -m venv venv
fi
source venv/bin/activate
python3 -m pip install -r requirements.txt

# .env 파일 설정 수정
# 이전 로직: echo "DATABASE_URL=mysql+pymysql://root:yourpassword@192.168.1.113:3306/chdb?charset=utf8mb4" > .env
# 변경 내용: DB 접속 주소를 127.0.0.1로 변경 (같은 우분투 내부에 있으므로 로컬 접속이 더 안정적입니다)
if [ ! -f .env ]; then
  echo "DATABASE_URL=mysql+pymysql://root:yourpassword@127.0.0.1:3306/chdb?charset=utf8mb4" > .env
  echo "SECRET_KEY=your_secret_key" >> .env
  echo ".env 파일이 생성되었습니다. 정보를 올바르게 수정해 주세요."
fi
cd ..

# 3. 프론트엔드 업데이트 및 빌드
echo "[3/4] Building Frontend (This may take a while)..."
cd frontend
npm install

# .env.local 설정 수정
# 이전 로직: echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
# 변경 내용: 브라우저에서 백엔드로 직접 요청을 보내야 하므로, localhost 대신 '태블릿의 실제 IP'를 사용하는 것이 좋습니다.
if [ ! -f .env.local ]; then
  echo "NEXT_PUBLIC_API_URL=http://$TABLET_IP:8000" > .env.local
  echo ".env.local에 API 주소($TABLET_IP)가 설정되었습니다."
fi

npm run build
cd ..

# 4. PM2를 통한 프로세스 재시작
echo "[4/4] Restarting services with PM2..."
pm2 delete all 2>/dev/null

# 백엔드 실행: --host 0.0.0.0 확인됨 (정상)
pm2 start "venv/bin/python3 -m uvicorn main:app --host 0.0.0.0 --port 8000" --name mycount-backend --cwd backend

# 프론트엔드 실행 수정
# 이전 로직: pm2 start "npm run start -- --port 3000 --hostname 0.0.0.0" --name mycount-frontend --cwd frontend
# 변경 내용: Termux proot의 uv_interface_addresses 문제를 피하기 위해 --hostname 옵션을 제거합니다.
pm2 start "npm run start -- --port 3000" --name mycount-frontend --cwd frontend

pm2 save

# 출력 메시지 수정: localhost 대신 실제 접근 가능한 IP 안내
CURRENT_IP=$(hostname -I | awk '{print $1}')
echo "=========================================="
echo " Deployment Complete!"
echo " Backend (API): http://$CURRENT_IP:8000"
echo " Frontend (UI): http://$CURRENT_IP:3000"
echo "=========================================="