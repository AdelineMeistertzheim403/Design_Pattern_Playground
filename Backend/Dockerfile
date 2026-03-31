# syntax=docker/dockerfile:1.7

FROM eclipse-temurin:17-jdk-jammy AS base
WORKDIR /workspace

COPY mvnw pom.xml ./
COPY .mvn .mvn

RUN chmod +x mvnw

FROM base AS dependencies
RUN ./mvnw -q -DskipTests dependency:go-offline

FROM dependencies AS dev
COPY src src

EXPOSE 8080

CMD ["./mvnw", "spring-boot:run"]

FROM dependencies AS build
COPY src src

RUN ./mvnw -q -DskipTests package

FROM eclipse-temurin:17-jre-jammy AS prod
WORKDIR /app

COPY --from=build /workspace/target/*.jar /app/app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
