# syntax=docker/dockerfile:1
# ---- build stage: compile + package (tests run in CI, skipped here) ----
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn -B -ntp dependency:go-offline
COPY src ./src
RUN mvn -B -ntp -DskipTests clean package

# ---- run stage: slim JRE ----
FROM eclipse-temurin:21-jre
WORKDIR /app
# curl for the container healthcheck; run as non-root
RUN apt-get update && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/* \
    && useradd -r -u 1001 spring
COPY --from=build /app/target/*.jar app.jar
RUN mkdir -p /app/uploads && chown -R spring:spring /app
USER spring
EXPOSE 8080
ENV JAVA_OPTS=""
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
