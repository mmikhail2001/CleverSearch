package user

import (
	"encoding/json"
	"net/http"

	"github.com/mmikhail2001/test-clever-search/internal/delivery/shared"
	"github.com/mmikhail2001/test-clever-search/internal/domain/cleveruser"
)

type Handler struct {
	usecase Usecase
}

func NewHandler(usecase Usecase) *Handler {
	return &Handler{
		usecase: usecase,
	}
}

func (h *Handler) Register(w http.ResponseWriter, r *http.Request) {
	var userDTO UserDTO
	err := json.NewDecoder(r.Body).Decode(&userDTO)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	newUser := cleveruser.User{
		Email:    userDTO.Email,
		Password: userDTO.Password,
	}

	_, err = h.usecase.Register(r.Context(), newUser)

	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
	}

	w.WriteHeader(http.StatusOK)
}

func (h *Handler) Login(w http.ResponseWriter, r *http.Request) {
	var userDTO UserDTO
	err := json.NewDecoder(r.Body).Decode(&userDTO)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	user := cleveruser.User{
		Email:    userDTO.Email,
		Password: userDTO.Password,
	}

	sessionID, err := h.usecase.Login(r.Context(), user)

	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
	}

	http.SetCookie(w, &http.Cookie{
		Name:  shared.CookieName,
		Value: sessionID,
		Path:  "/",
	})

	w.WriteHeader(http.StatusOK)
}

func (h *Handler) Logout(w http.ResponseWriter, r *http.Request) {
	sessionCookie, err := r.Cookie(shared.CookieName)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	err = h.usecase.Logout(r.Context(), sessionCookie.Value)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
	}

	http.SetCookie(w, &http.Cookie{
		Name:   shared.CookieName,
		Value:  "",
		Path:   "/",
		MaxAge: -1,
	})
	w.WriteHeader(http.StatusOK)
}

func (h *Handler) Profile(w http.ResponseWriter, r *http.Request) {
	user, ok := r.Context().Value(shared.UserContextName).(cleveruser.User)
	if !ok {
		http.Error(w, "User not found in context", http.StatusInternalServerError)
		return
	}
	email := EmailDTO{
		Email: user.Email,
	}

	json.NewEncoder(w).Encode(email)
}
