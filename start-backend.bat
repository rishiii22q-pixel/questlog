@echo off
echo ============================
echo  Starting QuestLog Backend
echo ============================
echo.
echo Backend API will run on: http://localhost:8080
echo H2 Console (DB Browser):  http://localhost:8080/h2-console
echo.
set JAVA_HOME=C:\Program Files\Java\jdk-17
set PATH=%PATH%;D:\maven\apache-maven-3.9.6\bin
cd /d "%~dp0backend"
mvn spring-boot:run
pause
