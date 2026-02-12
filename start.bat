@echo off
title Linux SQL Game - Serveur Local
echo.
echo  ========================================
echo   Linux SQL Game - Simulateur de Terminal
echo  ========================================
echo.
echo  Demarrage du serveur local...
echo  Ouvre ton navigateur sur : http://localhost:3000
echo.
echo  Pour arreter : ferme cette fenetre ou Ctrl+C
echo  ========================================
echo.

start http://localhost:3000

npx serve . -l 3000 -s
