FROM golang:1.21

WORKDIR /app
RUN apt-get update && apt-get install libreoffice -y
COPY . .
# go mod vendor or go mod tidy
RUN go build cmd/main.go
CMD ["./main"]
