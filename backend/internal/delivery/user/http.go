package user

import (
	"encoding/json"
	"errors"
	"log"
	"net/http"

	"github.com/WindowsKonon1337/CleverSearch/internal/delivery/shared"
	"github.com/WindowsKonon1337/CleverSearch/internal/domain/cleveruser"
)

type Handler struct {
	usecase      Usecase
	cloudUsecase CloudUsecase
}

func NewHandler(usecase Usecase, cloudUsecase CloudUsecase) *Handler {
	return &Handler{
		usecase:      usecase,
		cloudUsecase: cloudUsecase,
	}
}

func (h *Handler) Register(w http.ResponseWriter, r *http.Request) {
	var userDTO UserDTO
	err := json.NewDecoder(r.Body).Decode(&userDTO)
	if err != nil {
		log.Println("Register parse data error:", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	newUser := cleveruser.User{
		Email:    userDTO.Email,
		Password: userDTO.Password,
	}

	_, err = h.usecase.Register(r.Context(), newUser)

	if err != nil {
		log.Println("Register usecase error:", err)
		switch {
		case errors.Is(err, cleveruser.ErrUserAlreadyExists):
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(shared.NewResponse(0, cleveruser.ErrUserAlreadyExists.Error(), nil))
		default:
			w.WriteHeader(http.StatusInternalServerError)
		}
		return
	}

	w.WriteHeader(http.StatusOK)
}

func (h *Handler) Login(w http.ResponseWriter, r *http.Request) {
	var userDTO UserDTO
	err := json.NewDecoder(r.Body).Decode(&userDTO)
	if err != nil {
		log.Println("Login parse data error:", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	user := cleveruser.User{
		Email:    userDTO.Email,
		Password: userDTO.Password,
	}

	sessionID, err := h.usecase.Login(r.Context(), user)

	if err != nil {
		log.Println("Login usecase error:", err)
		switch {
		case errors.Is(err, cleveruser.ErrUserNotFound) || errors.Is(err, cleveruser.ErrNotValidPassword):
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(shared.NewResponse(0, cleveruser.ErrWrongCredentials.Error(), nil))
		default:
			w.WriteHeader(http.StatusInternalServerError)

		}
		return
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
		log.Println("Logout without cookie:", err)
		json.NewEncoder(w).Encode(shared.NewResponse(0, cleveruser.ErrCookieNotFound.Error(), nil))
		w.WriteHeader(http.StatusOK)
		return
	}

	err = h.usecase.Logout(r.Context(), sessionCookie.Value)
	http.SetCookie(w, &http.Cookie{
		Name:   shared.CookieName,
		Value:  "",
		Path:   "/",
		MaxAge: -1,
	})

	if err != nil {
		log.Println("Logout usecase error:", err)
		switch {
		case errors.Is(err, cleveruser.ErrSessionNotFound):
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(shared.NewResponse(0, cleveruser.ErrSessionNotFound.Error(), nil))
			w.WriteHeader(http.StatusOK)
		default:
			w.WriteHeader(http.StatusInternalServerError)
		}
		return
	}
	w.WriteHeader(http.StatusOK)
}

func (h *Handler) Profile(w http.ResponseWriter, r *http.Request) {
	user, ok := r.Context().Value(shared.UserContextName).(cleveruser.User)
	if !ok {
		log.Println("User not found in context")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	err := h.cloudUsecase.UpdateAllTokens(r.Context(), &user)
	if err != nil {
		log.Println("UpdateAllTokens err:", err)
		w.WriteHeader(http.StatusBadRequest)
	}

	profile := ProfileDTO{
		ID:    user.ID,
		Email: user.Email,
	}

	for _, cloud := range user.ConnectedClouds {
		connectedCloud := ConnectedCloud{
			CloudEmail:  cloud.CloudEmail,
			Disk:        cloud.Cloud,
			AccessToken: cloud.Token.AccessToken,
		}
		profile.ConnectedClouds = append(profile.ConnectedClouds, connectedCloud)
	}

	json.NewEncoder(w).Encode(profile)
}
