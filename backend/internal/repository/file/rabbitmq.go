package file

import (
	"context"
	"encoding/json"

	"github.com/WindowsKonon1337/CleverSearch/internal/domain/file"
	"github.com/streadway/amqp"
)

var queueName string = "transmit-queue"

func (r *Repository) PublishMessage(ctx context.Context, file file.File) error {
	fileDTO := fileForQueueDTO{
		ID:     file.ID,
		Path:   file.Path,
		Bucket: file.Bucket,
		Type:   string(file.FileType),
	}

	fileJSON, err := json.Marshal(fileDTO)
	if err != nil {
		return err
	}

	err = r.channelRabbitMQ.Publish(
		"",
		queueName,
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
