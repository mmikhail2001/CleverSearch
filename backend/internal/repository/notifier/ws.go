package notifier

import (
	"encoding/json"
	"log"

	"github.com/WindowsKonon1337/CleverSearch/internal/domain/notifier"
	"github.com/dranikpg/dto-mapper"
	"github.com/gorilla/websocket"
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

		var fileDTO FileDTO
		dto.Map(&fileDTO, message.File)

		messageDTO := NotifyDTO{
			Event: message.Event,
			File:  fileDTO,
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
