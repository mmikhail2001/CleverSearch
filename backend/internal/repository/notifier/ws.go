package notifier

import (
	"encoding/json"
	"log"

	"github.com/gorilla/websocket"
	"github.com/mmikhail2001/test-clever-search/internal/domain/notifier"
)

type Gateway struct {
}

func NewGateway() *Gateway {
	return &Gateway{}
}

func (gw *Gateway) WriteLoop(client *notifier.Client) {
	defer func() {
		client.Conn.Close()
	}()
	for {
		message, ok := <-client.Send
		if !ok {
			break
		}

		messageDTO := NotifyDTO{
			Event:  message.Event,
			UserID: message.UserID,
			Path:   message.Path,
			Status: message.Status,
		}

		jsonMsg, err := json.Marshal(messageDTO)
		if err != nil {
			log.Printf("Error on marshalling message: %v", err)
			continue
		}

		if err := client.Conn.WriteMessage(websocket.TextMessage, jsonMsg); err != nil {
			log.Printf("Error on sending message: %v", err)
			break
		}
	}
}
