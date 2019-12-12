FROM maven AS builder
WORKDIR '/app'
COPY . .
RUN mvn clean install

FROM openjdk:11-jre-slim
COPY --from=builder /app/target /app
COPY --from=builder /app/config /app/config
WORKDIR '/app'
CMD ["java", "-jar", "JavaWorker-0.0.1-SNAPSHOT.jar"]
