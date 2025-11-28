@echo off
cd /d %~dp0
echo Generating SSL certificate for localhost...
openssl req -x509 -newkey rsa:2048 -keyout localhost.key -out localhost.crt -days 365 -nodes -config openssl.cnf
echo.
echo Certificate generated successfully!
echo Files created:
echo - localhost.key (private key)
echo - localhost.crt (certificate)
echo.
pause
