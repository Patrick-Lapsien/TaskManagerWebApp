# Dockerfile for Spring Boot backend
FROM maven:3.9.4-eclipse-temurin-17 AS build
WORKDIR /app
COPY backend/pom.xml .
COPY backend/src ./src
RUN mvn clean package -q -DskipTests

FROM eclipse-temurin:17-jre-slim
WORKDIR /app
COPY --from=build /app/target/task-manager-backend-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
CMD ["java", "-jar", "app.jar"]
