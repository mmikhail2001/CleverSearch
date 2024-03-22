package middleware

import (
	"context"
	"encoding/json"
	"errors"
	"log"
	"net/http"

	"github.com/WindowsKonon1337/CleverSearch/internal/delivery/shared"
	"github.com/WindowsKonon1337/CleverSearch/internal/domain/cleveruser"
)

type Middleware struct {
	userUsecase UserUsecase
}

func NewMiddleware(userUsecase UserUsecase) *Middleware {
	return &Middleware{
		userUsecase: userUsecase,
	}
}

func (m *Middleware) AddJSONHeader(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		next.ServeHTTP(w, r)
	})
}

func (m *Middleware) AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		sessionCookie, err := r.Cookie(shared.CookieName)
		if err != nil {
			log.Println("User not auth:", err)
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(shared.NewResponse(cleveruser.StatusAuthenticationRequired, cleveruser.ErrAuthenticationRequired.Error(), nil))
			return
		}

		user, err := m.userUsecase.GetUserBySession(r.Context(), sessionCookie.Value)
		if err != nil {
			log.Println("Session unvalid:", err)
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(shared.NewResponse(cleveruser.StatusSessionNotFound, cleveruser.ErrSessionNotFound.Error(), nil))
			return
		}

		ctx := context.WithValue(r.Context(), shared.UserContextName, user)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func (m *Middleware) GetUserIDMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		userID := r.URL.Query().Get("user_id")
		user, err := m.userUsecase.GetUserByID(r.Context(), userID)
		if err != nil {
			log.Println("GetUserID:", err)
			if errors.Is(err, cleveruser.ErrUserNotFound) {
				w.WriteHeader(http.StatusBadRequest)
				json.NewEncoder(w).Encode(shared.NewResponse(cleveruser.StatusUserNotFound, err.Error(), nil))
				return
			}
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		ctx := context.WithValue(r.Context(), shared.UserContextName, user)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
