package middleware

import (
	"context"
	"log"
	"net/http"

	"github.com/WindowsKonon1337/CleverSearch/internal/delivery/shared"
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
			return
		}

		user, err := m.userUsecase.GetUserBySession(r.Context(), sessionCookie.Value)
		if err != nil {
			log.Println("Session unvalid:", err)
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		ctx := context.WithValue(r.Context(), shared.UserContextName, user)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
