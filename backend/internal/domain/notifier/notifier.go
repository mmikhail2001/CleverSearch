package notifier

import "github.com/gorilla/websocket"

type Notify struct {
	Event  string
	UserID string
	S3URL  string
}

type Client struct {
	UserID string
	Conn   *websocket.Conn
	Send   chan Notify
}
