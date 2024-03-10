package notifier

import "github.com/gorilla/websocket"

type Notify struct {
	Event  string
	UserID string
	Path   string
	Status string
	Link   string
}

type Client struct {
	UserID string
	Conn   *websocket.Conn
	Send   chan Notify
}
