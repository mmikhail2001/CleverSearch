package file

import (
	"context"
	"encoding/json"

	"github.com/mmikhail2001/test-clever-search/internal/domain/file"
	"github.com/streadway/amqp"
)

func (r *Repository) PublishMessage(ctx context.Context, file file.File) error {
	fileDTO := fileForQueueDTO{
		ID:          file.ID,
		S3URL:       file.S3URL,
		ContentType: file.ContentType,
	}

	fileJSON, err := json.Marshal(fileDTO)
	if err != nil {
		return err
	}

	err = r.channelRabbitMQ.Publish(
		"",
		channelName,
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
