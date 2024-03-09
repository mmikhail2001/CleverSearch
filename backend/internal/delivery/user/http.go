package user

import (
	"encoding/json"
	"net/http"
	"sync"

	"github.com/google/uuid"
	"github.com/mmikhail2001/test-clever-search/internal/domain/user"
)

type Handler struct {
	users        map[string]user.User
	userSessions map[string]user.User
	usersLock    sync.RWMutex
	usecase      Usecase
}

func NewHandler(usecase Usecase) *Handler {
	return &Handler{
		usecase:      usecase,
		users:        make(map[string]user.User),
		userSessions: make(map[string]user.User),
	}
}

func (h *Handler) Register(w http.ResponseWriter, r *http.Request) {
	var userDTO UserDTO
	err := json.NewDecoder(r.Body).Decode(&userDTO)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	user := user.User{
		ID:       uuid.New().String(),
		Email:    userDTO.Email,
		Password: userDTO.Password,
	}

	h.usersLock.Lock()
	defer h.usersLock.Unlock()

	h.users[user.ID] = user

	w.WriteHeader(http.StatusOK)
}

func (h *Handler) Login(w http.ResponseWriter, r *http.Request) {
	var userDTO UserDTO
	err := json.NewDecoder(r.Body).Decode(&userDTO)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	user := user.User{
		Email:    userDTO.Email,
		Password: userDTO.Password,
	}

	h.usersLock.RLock()
	defer h.usersLock.RUnlock()

	for _, userFromStore := range h.users {
		if userFromStore.Email == user.Email && userFromStore.Password == user.Password {
			sessionID := uuid.New().String()
			http.SetCookie(w, &http.Cookie{
				Name:  "session_id",
				Value: sessionID,
				Path:  "/",
			})

			h.userSessions[sessionID] = userFromStore

			w.WriteHeader(http.StatusOK)
			return
		}
	}

	w.WriteHeader(http.StatusBadRequest)
}

func (h *Handler) Logout(w http.ResponseWriter, r *http.Request) {
	sessionCookie, err := r.Cookie("session_id")
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	h.usersLock.Lock()
	defer h.usersLock.Unlock()

	delete(h.userSessions, sessionCookie.Value)

	http.SetCookie(w, &http.Cookie{
		Name:   "session_id",
		Value:  "",
		Path:   "/",
		MaxAge: -1,
	})
	w.WriteHeader(http.StatusOK)
}

func (h *Handler) GetUserSessions() map[string]user.User {
	return h.userSessions
}

func (h *Handler) Profile(w http.ResponseWriter, r *http.Request) {
	user, ok := r.Context().Value("user").(user.User)
	if !ok {
		http.Error(w, "User not found in context", http.StatusInternalServerError)
		return
	}
	email := EmailDTO{
		Email: user.Email,
	}

	json.NewEncoder(w).Encode(email)
}
