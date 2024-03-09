package notifier

import (
	"sync"

	"github.com/mmikhail2001/test-clever-search/internal/domain/notifier"
)

type Usecase struct {
	clients    map[string]*notifier.Client
	newMessage chan notifier.Notify
	register   chan *notifier.Client
	unregister chan *notifier.Client

	gate Gateway
}

var (
	usecase *Usecase
	once    sync.Once
)

// NewHub возвращает единственный экземпляр Hub
func NewUsecase(gate Gateway) *Usecase {
	once.Do(func() {
		usecase = &Usecase{
			newMessage: make(chan notifier.Notify),
			register:   make(chan *notifier.Client),
			unregister: make(chan *notifier.Client),
			clients:    make(map[string]*notifier.Client),
			gate:       gate,
		}
	})
	go usecase.run()
	return usecase
}

// убрать всю логику с каналами, просто при регистрации нужно запомнить ws.conn
// при необходимости что-то отправить, вызываем соответствующий метод
// нет необходимости крутиться в горутине, чтобы в вечном цикле проверять ws на наличие сообщений на чтение

// TODO: если канал занят, то плохо
// нужен контекст с таймаутом
func (h *Usecase) Notify(notify notifier.Notify) {
	h.newMessage <- notify
}

func (h *Usecase) Register(client *notifier.Client) {
	usecase.register <- client
	go h.gate.WriteLoop(client)
}

func (h *Usecase) run() {
	for {
		select {
		case client := <-h.register:
			h.clients[client.UserID] = client
		case client := <-h.unregister:
			if _, ok := h.clients[client.UserID]; ok {
				delete(h.clients, client.UserID)
				close(client.Send)
			}
		case message := <-h.newMessage:
			// TODO: ответ - ошибка
			// убрать в метод Notify
			// вместо client.Send <- message вызов метода gateway
			if client, ok := h.clients[message.UserID]; ok {
				select {
				case client.Send <- message:
				default:
					close(client.Send)
					delete(h.clients, client.UserID)
				}
			}
		}
	}
}
