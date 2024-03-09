package middleware

import (
	"context"
	"net/http"

	"github.com/mmikhail2001/test-clever-search/internal/domain/user"
)

type Middleware struct {
	userHandler UserHandler
}

func NewMiddleware(uh UserHandler) *Middleware {
	return &Middleware{
		userHandler: uh,
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
		sessionCookie, err := r.Cookie("session_id")
		if err != nil {
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		users := m.userHandler.GetUsers()
		var user user.User
		var flag = false
		for session, u := range users {
			if session == sessionCookie.Value {
				user = u
				flag = true
				break
			}
		}

		if !flag {
			http.Error(w, "User not found", http.StatusNotFound)
			return
		}

		ctx := context.WithValue(r.Context(), "user", user)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
