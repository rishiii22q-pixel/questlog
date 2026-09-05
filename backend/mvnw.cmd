@REM ----------------------------------------------------------------------------
@REM Maven Wrapper startup batch script
@REM ----------------------------------------------------------------------------

@IF "%__MVNW_ARG0_NAME__%"=="" (SET "MVN_CMD=mvn") ELSE (SET "MVN_CMD=%__MVNW_ARG0_NAME__%")
@SET MAVEN_WRAPPER_JAR="%~dp0.mvn\wrapper\maven-wrapper.jar"
@SET JAVA_EXE=%JAVA_HOME%/bin/java.exe

@IF NOT EXIST "%JAVA_EXE%" SET JAVA_EXE=java

@"%JAVA_EXE%" -jar %MAVEN_WRAPPER_JAR% %*
