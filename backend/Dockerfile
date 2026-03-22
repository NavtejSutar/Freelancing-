# ── Stage 1: Build ──────────────────────────────────────────────────────────
FROM maven:3.9.6-eclipse-temurin-21 AS builder

WORKDIR /app

# Copy pom.xml first for dependency caching
COPY pom.xml .
RUN mvn dependency:go-offline -q

# Copy source and build
COPY src ./src
RUN mvn clean package -DskipTests -q

# ── Stage 2: Run ─────────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Create uploads directory
RUN mkdir -p /app/uploads/pdfs /app/uploads/signatures

# Copy jar from build stage
COPY --from=builder /app/target/freelancing-platform-0.0.1-SNAPSHOT.jar app.jar

# Expose port
EXPOSE 8090

# Run
ENTRYPOINT ["java", "-jar", "app.jar"]