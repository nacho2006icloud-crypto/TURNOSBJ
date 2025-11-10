@echo off
echo Ejecutando script de migración de deportes...
mysql -u root -p turnosbj < fix_deportes.sql
echo.
echo Script completado. Presiona cualquier tecla para salir.
pause
