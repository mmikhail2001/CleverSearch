package static

import (
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"os"

	"github.com/WindowsKonon1337/CleverSearch/internal/delivery/shared"
	fileDomain "github.com/WindowsKonon1337/CleverSearch/internal/domain/file"
	"github.com/gorilla/mux"
)

type Handler struct {
	fileServer http.Handler
	basedir    string
	usecase    Usecase
}

func NewHandler(basedir string, usecase Usecase) *Handler {
	return &Handler{
		fileServer: http.FileServer(http.Dir(basedir)),
		basedir:    basedir,
		usecase:    usecase,
	}
}

func (h *Handler) GetStatic(w http.ResponseWriter, r *http.Request) {
	if _, err := os.Stat(h.basedir + r.URL.Path); err != nil {
		http.ServeFile(w, r, h.basedir+"/index.html")
	} else {
		h.fileServer.ServeHTTP(w, r)
	}
}

func (h *Handler) GetShering(w http.ResponseWriter, r *http.Request) {
	sharing := r.URL.Query().Get("sharing")
	if sharing != "" {
		vars := mux.Vars(r)
		if vars["dir_uuid"] == "" {
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(shared.NewResponse(0, "dir_uuid in query string is empty", nil))
			return
		}
		err := h.usecase.AddSheringGrant(r.Context(), vars["dir_uuid"])
		if err != nil {
			log.Println("AddSheringGrant err", err)
			switch {
			case errors.Is(err, fileDomain.ErrDirNotSharing):
				w.WriteHeader(http.StatusBadRequest)
				json.NewEncoder(w).Encode(shared.NewResponse(fileDomain.StatusDirNotSharing, err.Error(), nil))
			case errors.Is(err, fileDomain.ErrNotFound):
				w.WriteHeader(http.StatusBadRequest)
				json.NewEncoder(w).Encode(shared.NewResponse(fileDomain.StatusNotFound, err.Error(), nil))
			default:
				w.WriteHeader(http.StatusInternalServerError)
			}
			return
		}
	}
	http.ServeFile(w, r, h.basedir+"/index.html")
}
