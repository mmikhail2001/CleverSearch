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
	exchangeName         = "direct_exchange"
	bindingKeys          = map[string]string{
		"queue_img":   "img",
		"queue_video": "video",
		"queue_audio": "audio",
		"queue_text":  "text",
	}
)

func NewClient() (*amqp.Channel, error) {
	var conn *amqp.Connection
	var err error

	// Attempt to connect to RabbitMQ with retries
	for i := 0; i < retryCount; i++ {
		conn, err = amqp.Dial(url)
		if err == nil {
			break
		}
		log.Println("Retry to connect to RabbitMQ")
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

	err = channel.ExchangeDeclare(
		exchangeName, // Name of the exchange
		"direct",     // Type
		true,         // Durable
		false,        // Auto-deleted
		false,        // Internal
		false,        // No-wait
		nil,          // Arguments
	)
	if err != nil {
		channel.Close()
		conn.Close()
		return nil, err
	}

	for queueName, key := range bindingKeys {
		_, err = channel.QueueDeclare(
			queueName,
			true,  // Durable
			false, // Delete when unused
			false, // Exclusive
			false, // No-wait
			nil,   // Arguments
		)
		if err != nil {
			channel.Close()
			conn.Close()
			return nil, err
		}

		err = channel.QueueBind(
			queueName,    // Queue name
			key,          // Routing key
			exchangeName, // Exchange name
			false,        // No-wait
			nil,          // Arguments
		)
		if err != nil {
			channel.Close()
			conn.Close()
			return nil, err
		}
	}

	return channel, nil
}
