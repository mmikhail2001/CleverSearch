package notifier

import (
	"github.com/WindowsKonon1337/CleverSearch/internal/domain/file"
	"github.com/gorilla/websocket"
)

type Notify struct {
	Event  string
	File   file.File
	UserID string
}

type Client struct {
	UserID string
	Conn   *websocket.Conn
	Send   chan Notify
}
