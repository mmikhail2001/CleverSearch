package notifier

import (
	"github.com/WindowsKonon1337/CleverSearch/internal/domain/file"
	"github.com/gorilla/websocket"
)

type Notify struct {
	Event    string
	UserID   string
	Path     string
	Status   string
	FileType file.FileType
}

type Client struct {
	UserID string
	Conn   *websocket.Conn
	Send   chan Notify
}
