FROM golang:1.21

WORKDIR /app
COPY backend .
# go mod vendor or go mod tidy
RUN go build cmd/main.go
CMD ["./main"]
