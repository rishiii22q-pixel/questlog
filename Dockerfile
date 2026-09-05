# ==========================================
# Multi-stage Dockerfile for QuestLog
# Single self-contained JAR (Frontend + Backend)
# ==========================================

# --- Stage 1: Build Vite React Frontend ---
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

# --- Stage 2: Build Spring Boot Backend ---
FROM maven:3.9-eclipse-temurin-17-alpine AS backend-builder
WORKDIR /app/backend

COPY backend/pom.xml ./
RUN mvn dependency:go-offline -B

COPY backend/src ./src

# Copy built frontend assets into Spring Boot's static folder
COPY --from=frontend-builder /app/frontend/dist ./src/main/resources/static

RUN mvn clean package -DskipTests

# --- Stage 3: Lightweight Production JRE Runtime ---
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Create data directory and configure non-root user permissions
RUN addgroup -S questlog && adduser -S questlog -G questlog \
    && mkdir -p /app/data \
    && chown -R questlog:questlog /app

# Copy built executable JAR from builder stage
COPY --from=backend-builder --chown=questlog:questlog /app/backend/target/*.jar app.jar

USER questlog

ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["java", "-Xmx400m", "-Xms128m", "-jar", "app.jar"]
