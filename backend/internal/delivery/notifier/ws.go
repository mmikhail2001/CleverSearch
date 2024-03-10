package notifier

import (
	"log"
	"net/http"

	"github.com/gorilla/websocket"
	"github.com/mmikhail2001/test-clever-search/internal/delivery/shared"
	"github.com/mmikhail2001/test-clever-search/internal/domain/cleveruser"
	"github.com/mmikhail2001/test-clever-search/internal/domain/notifier"
)

var bufferChannelNotification = 10

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

type Handler struct {
	usecase Usecase
}

func NewHandler(usecase Usecase) *Handler {
	return &Handler{
		usecase: usecase,
	}
}

func (h *Handler) ConnectNotifications(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Error Upgrade:", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	user, ok := r.Context().Value(shared.UserContextName).(cleveruser.User)
	if !ok {
		log.Println("User not found in context")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	client := &notifier.Client{
		Conn:   conn,
		UserID: user.ID,
		Send:   make(chan notifier.Notify, bufferChannelNotification),
	}
	h.usecase.Register(client)
}
