FROM golang:alpine

RUN mkdir /app
COPY . /app/.
WORKDIR /app
ARG RABBIT_HOST
RUN sed -i -E 's/localhost:5672/'$RABBIT_HOST'/g' app.go

RUN go mod init github.com/guanocoder/gotest
RUN go build -o main .
CMD ["/app/main"]