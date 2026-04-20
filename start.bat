@echo off
echo ==========================================
echo Starting MyCount Application...
echo ==========================================

echo [Backend] Initializing FastAPI Server...
start cmd /k "cd backend && call venv\Scripts\activate.bat && python -m uvicorn main:app --reload --port 8000"

echo [Frontend] Initializing Next.js UI Server...
start cmd /k "cd frontEnd && npm run dev"

echo.
echo Application will be available at:
echo http://localhost:3000
echo.
echo ==========================================
echo Default Admin Login:
echo ID: admin
echo PW: admin123
echo ==========================================
pause
