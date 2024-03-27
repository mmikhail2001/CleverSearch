package rabbitmq

import (
	"log"
	"time"

	"github.com/streadway/amqp"
)

var (
	url           string = "amqp://guest:guest@rabbitmq:5672/"
	retryCount           = 5
	retryInterval        = 2 * time.Second
	queueName            = "transmit-queue"
)

func NewClient() (*amqp.Channel, error) {
	var conn *amqp.Connection
	var err error

	for i := 0; i < retryCount; i++ {
		conn, err = amqp.Dial(url)
		if err == nil {
			break
		}
		log.Println("retry to connect rabbitmq")
		time.Sleep(retryInterval)
	}

	if err != nil {
		return nil, err
	}

	channel, err := conn.Channel()
	if err != nil {
		conn.Close()
		return nil, err
	}

	_, err = channel.QueueDeclare(
		queueName,
		true,
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		channel.Close()
		conn.Close()
		return nil, err
	}

	return channel, nil
}
