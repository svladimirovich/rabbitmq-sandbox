FROM maven AS builder
WORKDIR /app
ADD pom.xml .
RUN mvn verify clean --fail-never
COPY . .
RUN mvn clean install

CMD ["java", "-jar", "target/JavaWorker-0.0.1-SNAPSHOT.jar"]