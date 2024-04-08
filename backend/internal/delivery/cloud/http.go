package cloud

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"sync"

	"github.com/WindowsKonon1337/CleverSearch/internal/domain/file"
	"github.com/google/uuid"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
	"google.golang.org/api/drive/v3"
)

type Handler struct {
	oauthConfig   *oauth2.Config
	stateMap      map[string]bool
	mapMutex      *sync.RWMutex
	staticHandler StaticHandler
	usecase       Usecase
}

func NewHandler(oauthConfig *oauth2.Config, staticHandler StaticHandler, usecase Usecase) *Handler {
	return &Handler{
		oauthConfig:   oauthConfig,
		stateMap:      make(map[string]bool),
		mapMutex:      &sync.RWMutex{},
		staticHandler: staticHandler,
		usecase:       usecase,
	}
}

func NewDriveClient() (*oauth2.Config, error) {
	b, err := os.ReadFile("creds.json")
	if err != nil {
		return nil, fmt.Errorf("unable to read client secret file: %v", err)
	}

	// TODO:
	oauthConfig, err := google.ConfigFromJSON(b, drive.DriveReadonlyScope)
	if err != nil {
		return nil, fmt.Errorf("unable to parse client secret file to config: %v", err)
	}

	return oauthConfig, nil
}

func (h *Handler) ConnectCloud(w http.ResponseWriter, r *http.Request) {
	log.Println("handle ConnectCloud")
	disk := r.URL.Query().Get("disk")
	// TODO: пока что только гугл диск
	_ = disk

	state := uuid.New().String()

	h.mapMutex.Lock()
	h.stateMap[state] = true
	h.mapMutex.Unlock()

	authURL := h.oauthConfig.AuthCodeURL(state, oauth2.AccessTypeOffline)

	json.NewEncoder(w).Encode(map[string]string{"redirect": authURL})
}

func (h *Handler) AuthProviderCallback(w http.ResponseWriter, r *http.Request) {
	log.Println("handle AuthProviderCallback")
	state := r.URL.Query().Get("state")

	h.mapMutex.RLock()
	_, exists := h.stateMap[state]
	h.mapMutex.RUnlock()

	if !exists {
		log.Println("AuthProviderCallback: Invalid state")
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	h.mapMutex.Lock()
	delete(h.stateMap, state)
	h.mapMutex.Unlock()

	code := r.URL.Query().Get("code")

	token, err := h.oauthConfig.Exchange(context.Background(), code)
	if err != nil {
		log.Println("Unable to exchange code for token:", err)
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	h.usecase.CloudConnect(r.Context(), token)
	h.staticHandler.GetStatic(w, r)

	// TODO: http.Redirect(w, r, "http://localhost/index.html", http.StatusTemporaryRedirect)
	// браузер не редиректит, отправляет тот же запрос: /api/clouds/callback
}

func (h *Handler) RefreshCloud(w http.ResponseWriter, r *http.Request) {
	disk := file.DiskType(r.URL.Query().Get("disk"))
	cloudEmail := r.URL.Query().Get("cloud_email")
	if disk == "" || cloudEmail == "" {
		log.Printf("RefreshCloud: emmpty disk [%s] or cloudEmail [%s]", disk, cloudEmail)
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	email, err := h.usecase.RefreshConnect(r.Context(), disk, cloudEmail)
	if err != nil {
		log.Println("RefreshConnect error: ", err)
		w.WriteHeader(http.StatusBadRequest)
	}
	log.Println("email:", email)
	w.WriteHeader(http.StatusOK)
}
