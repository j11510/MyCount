#!/bin/bash

# MyCount Deployment Script for Termux (Ubuntu proot)

echo "=========================================="
echo " Starting MyCount Update & Deployment"
echo "=========================================="

# 1. 소스 코드 동기화
echo "[1/4] Pulling latest code from GitHub..."
git pull origin main

# 2. 백엔드 업데이트
echo "[2/4] Updating Backend dependencies (using Virtual Env)..."
cd backend
# 가상환경 생성 및 활성화
if [ ! -d "venv" ]; then
  python3 -m venv venv
fi
source venv/bin/activate
python3 -m pip install -r requirements.txt
# .env 파일이 없다면 생성 (필요 시 수정)
if [ ! -f .env ]; then
  echo "DATABASE_URL=mysql+pymysql://root:yourpassword@192.168.1.113:3306/chdb?charset=utf8mb4" > .env
  echo "SECRET_KEY=your_secret_key" >> .env
  echo ".env 파일이 생성되었습니다. 정보를 올바르게 수정해 주세요."
fi
cd ..

# 3. 프론트엔드 업데이트 및 빌드
echo "[3/4] Building Frontend (This may take a while)..."
cd frontend
npm install
# .env.local 설정
if [ ! -f .env.local ]; then
  echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
fi
npm run build
cd ..

# 4. PM2를 통한 프로세스 재시작
echo "[4/4] Restarting services with PM2..."
pm2 restart all || (
  pm2 start "./venv/bin/python3 -m uvicorn main:app --host 0.0.0.0 --port 8000" --name mycount-backend
  pm2 start "npm run start" --name mycount-frontend
)

echo "=========================================="
echo " Deployment Complete!"
echo " Backend: http://localhost:8000"
echo " Frontend: http://localhost:3000"
echo "=========================================="
