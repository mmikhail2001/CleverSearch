package notifier

import (
	"log"
	"net/http"

	"github.com/gorilla/websocket"
	"github.com/mmikhail2001/test-clever-search/internal/domain/notifier"
	"github.com/mmikhail2001/test-clever-search/internal/domain/user"
)

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
		log.Println("Error with HandleConnectWS:", err)
		return
	}

	user, ok := r.Context().Value("user").(user.User)
	if !ok {
		http.Error(w, "User not found in context", http.StatusInternalServerError)
		return
	}

	client := &notifier.Client{
		Conn:   conn,
		UserID: user.ID,
		Send:   make(chan notifier.Notify, 5),
	}
	h.usecase.Register(client)
}
