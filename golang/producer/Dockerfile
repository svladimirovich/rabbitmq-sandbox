FROM golang:alpine

RUN mkdir /app
COPY . /app/.
WORKDIR /app
RUN go mod init github.com/guanocoder/gotest
RUN go build -o main .
CMD ["/app/main"]