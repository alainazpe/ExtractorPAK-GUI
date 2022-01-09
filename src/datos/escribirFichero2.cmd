@echo off
cd datos
"ExtraerPAK-CLI.exe" %1 %2 > status.txt
exit