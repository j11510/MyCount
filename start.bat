@echo off
echo ==========================================
echo Starting MyCount Application (Local)...
echo ==========================================

echo [Backend] Initializing Spring Boot 3 Server (MariaDB)...
set SPRING_PROFILES_ACTIVE=prod
set DATABASE_URL=jdbc:mariadb://localhost:3306/chdb
set DB_USER=root
set DB_PASSWORD=admin1234
start cmd /k "cd spring_backend && gradlew.bat bootRun"
echo [Frontend] Initializing Next.js UI Server...
start cmd /k "cd frontEnd && npm run dev"

echo.
echo Application will be available at:
echo Frontend: http://localhost:3000
echo Backend API: http://localhost:8080
echo Swagger UI: http://localhost:8080/swagger-ui/index.html
pause
