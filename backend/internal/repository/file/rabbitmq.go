package file

import (
	"context"
	"encoding/json"

	"github.com/WindowsKonon1337/CleverSearch/internal/domain/file"
	"github.com/streadway/amqp"
)

var (
	exchangeName string = "direct_exchange"
)

func (r *Repository) PublishMessage(ctx context.Context, file file.File) error {
	fileDTO := fileForQueueDTO{
		ID:       file.ID,
		Path:     file.Path,
		Bucket:   file.Bucket,
		FileType: string(file.FileType),
	}

	fileJSON, err := json.Marshal(fileDTO)
	if err != nil {
		return err
	}

	routingKey := file.FileType
	switch routingKey {
	case "img", "video", "audio", "text":
	default:
		routingKey = "unknown"
	}

	err = r.channelRabbitMQ.Publish(
		exchangeName,       // Use the configured exchange name
		string(routingKey), // Use the file type as the routing key
		false,
		false,
		amqp.Publishing{
			ContentType: "application/json",
			Body:        fileJSON,
		},
	)
	if err != nil {
		return err
	}

	return nil
}
