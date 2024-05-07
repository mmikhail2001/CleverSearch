package user

import (
	"encoding/base64"
	"encoding/json"
	"errors"
	"io"
	"log"
	"net/http"
	"strings"

	"github.com/WindowsKonon1337/CleverSearch/internal/delivery/shared"
	"github.com/WindowsKonon1337/CleverSearch/internal/domain/cleveruser"
	"github.com/WindowsKonon1337/CleverSearch/internal/domain/file"
	"github.com/gorilla/mux"
)

var limitSizeAvatar int64 = 10 * 1024 * 1024

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
			json.NewEncoder(w).Encode(shared.NewResponse(cleveruser.StatusUserAlreadyExists, cleveruser.ErrUserAlreadyExists.Error(), nil))
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
		case errors.Is(err, cleveruser.ErrUserNotFound) || errors.Is(err, cleveruser.ErrNotValidPassword) || errors.Is(err, cleveruser.ErrWrongCredentials):
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(shared.NewResponse(cleveruser.StatusWrongCredentials, cleveruser.ErrWrongCredentials.Error(), nil))
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
		json.NewEncoder(w).Encode(shared.NewResponse(cleveruser.StatusCookieNotFound, cleveruser.ErrCookieNotFound.Error(), nil))
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
			json.NewEncoder(w).Encode(shared.NewResponse(cleveruser.StatusSessionNotFound, cleveruser.ErrSessionNotFound.Error(), nil))
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

func (h *Handler) AddAvatar(w http.ResponseWriter, r *http.Request) {
	r.Body = http.MaxBytesReader(w, r.Body, limitSizeAvatar)
	f, handler, err := r.FormFile("avatar")
	if err != nil {
		log.Printf("Failed to parse avatar file from the body: %v\n", err)
		if errors.As(err, new(*http.MaxBytesError)) {
			log.Printf("The size exceeded the maximum size equal to %d mb: %v\n", limitSizeAvatar/1024/1024, err)
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(shared.NewResponse(file.StatusFileExceedsMaxSize, file.ErrFileExceedsMaxSize.Error(), nil))
			return
		}
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	defer f.Close()

	log.Printf("Uploading: Avatar: %+v", handler.Filename)

	var contentType string
	if contentTypes, ok := handler.Header["Content-Type"]; ok && len(contentTypes) > 0 {
		contentType = contentTypes[0]
	} else {
		log.Println(file.ErrContentTypeNotSet.Error())
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(shared.NewResponse(file.StatusContentTypeNotSet, file.ErrContentTypeNotSet.Error(), nil))
		return
	}

	if contentType != "image/jpeg" && contentType != "image/png" {
		log.Println("avatar content-type is invalid")
		w.WriteHeader(http.StatusInternalServerError)
	}

	err = h.usecase.AddAvatar(r.Context(), f, contentType)
	if err != nil {
		log.Println("usecase AddAvatar err:", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
}

func (h *Handler) GetAvatar(w http.ResponseWriter, r *http.Request) {
	userEmail := mux.Vars(r)["user_email"]
	avatarBase64, contentType, err := h.usecase.GetAvatar(r.Context(), userEmail)
	if err != nil {
		log.Println("GetAavatar err:", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", contentType)
	data := base64.NewDecoder(base64.StdEncoding, strings.NewReader(avatarBase64))
	io.Copy(w, data)
}
