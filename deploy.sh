#!/bin/bash

# MyCount Deployment Script for Spring Boot (JDK 17)
# This script is intended for standalone deployment (e.g. Termux or native Linux)

echo "=========================================="
echo " Starting MyCount Update & Deployment"
echo "=========================================="

# 1. 소스 코드 동기화
echo "[1/4] Pulling latest code from GitHub..."
git pull origin main

# 태블릿/서버 IP 자동 감지
TABLET_IP=$(hostname -I | awk '{print $1}')
echo "Detected IP: $TABLET_IP"

# 2. 백엔드 업데이트 및 빌드
echo "[2/4] Building Spring Boot Backend (JDK 17)..."
cd spring_backend
chmod +x gradlew
./gradlew build -x test --no-daemon

# .env 파일 설정 확인
if [ ! -f .env ]; then
  echo "DATABASE_URL=jdbc:mariadb://127.0.0.1:3306/chdb" > .env
  echo "DB_USER=root" >> .env
  echo "DB_PASSWORD=admin1234" >> .env
  echo "SPRING_PROFILES_ACTIVE=prod" >> .env
  echo ".env 파일이 생성되었습니다. DB 정보를 확인해 주세요."
fi
cd ..

# 3. 프론트엔드 업데이트 및 빌드
echo "[3/4] Building Frontend..."
cd frontend
npm install

# .env.local 설정 수정 (백엔드 포트 8080 반영)
if [ ! -f .env.local ]; then
  echo "NEXT_PUBLIC_API_URL=http://$TABLET_IP:8080" > .env.local
  echo ".env.local에 API 주소($TABLET_IP)가 설정되었습니다."
fi

npm run build
cd ..

# 4. PM2를 통한 프로세스 재시작
echo "[4/4] Restarting services with PM2..."
pm2 delete all 2>/dev/null

# 백엔드 실행 (Spring Boot JAR)
JAR_FILE=$(ls spring_backend/build/libs/*.jar | grep -v "plain" | head -n 1)
if [ -f "$JAR_FILE" ]; then
    pm2 start "java -jar $JAR_FILE" --name mycount-backend
else
    echo "Error: Jar file not found in spring_backend/build/libs/"
    exit 1
fi

# 프론트엔드 실행
pm2 start "npm run start -- --port 3000" --name mycount-frontend --cwd frontend

pm2 save

echo "=========================================="
echo " Deployment Complete!"
echo " Backend (API): http://$TABLET_IP:8080"
echo " Frontend (UI): http://$TABLET_IP:3000"
echo "=========================================="
