FROM golang:1.21

WORKDIR /app
RUN echo "hello"
COPY . .
# go mod vendor or go mod tidy
RUN go build cmd/main.go
CMD ["./main"]
