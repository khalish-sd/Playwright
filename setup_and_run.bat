@echo off
setlocal

:: Default values
set BROWSERS=chromium
set LOCATOR_FILE=locators.json
set TAGS=
set HEADLESS=false
set BASE_URL=https://demoqa.com/automation-practice-form

:: Prompt user for browsers (multiple supported)
echo Select browsers (chromium,firefox,webkit) [Default: %BROWSERS%]:
set /p BROWSERS_INPUT=
if not "%BROWSERS_INPUT%"=="" set BROWSERS=%BROWSERS_INPUT%

:: Prompt user for locator file
echo Enter locator file name [Default: %LOCATOR_FILE%]:
set /p LOCATOR_FILE_INPUT=
if not "%LOCATOR_FILE_INPUT%"=="" set LOCATOR_FILE=%LOCATOR_FILE_INPUT%

:: Prompt user for base URL
echo Enter base URL [Default: %BASE_URL%]:
set /p BASE_URL_INPUT=
if not "%BASE_URL_INPUT%"=="" set BASE_URL=%BASE_URL_INPUT%

:: Prompt user for tags
echo Enter tags (e.g., @smoke, @regression) [Leave empty to run all tests]:
set /p TAGS_INPUT=
if not "%TAGS_INPUT%"=="" set TAGS=--tags "%TAGS_INPUT%"

:: Prompt user for headless mode
echo Run in headless mode? (yes/no) [Default: %HEADLESS%]:
set /p HEADLESS_INPUT=
if /I "%HEADLESS_INPUT%"=="yes" set HEADLESS=true

:: Run tests for each selected browser
for %%B in (%BROWSERS%) do (
    echo Running tests with:
    echo Browser: %%B
    echo Base URL: %BASE_URL%
    echo Locator File: %LOCATOR_FILE%
    echo Tags: %TAGS%
    echo Headless: %HEADLESS%

    :: Run PowerShell command with proper escaping
    powershell -Command "$env:BROWSER='%%B'; $env:LOCATOR_FILE='%LOCATOR_FILE%'; $env:BASE_URL='%BASE_URL%'; $env:HEADLESS='%HEADLESS%'; npx cucumber-js --require-module ts-node/register --require src/test/steps/*.ts --format html:reports/%%B-report.html --format json:reports/%%B-report.json %TAGS%"
)

endlocal
pause