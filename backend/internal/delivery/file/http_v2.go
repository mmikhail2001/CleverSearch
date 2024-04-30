package file

import (
	"context"
	"encoding/json"
	"errors"
	"log"
	"net/http"

	"github.com/WindowsKonon1337/CleverSearch/internal/delivery/shared"
	"github.com/WindowsKonon1337/CleverSearch/internal/domain/file"
	"github.com/dranikpg/dto-mapper"
)

func (h *Handler) responseFiles(ctx context.Context, w http.ResponseWriter, files []file.File, err error, nameFunc string) {
	if err != nil {
		log.Println(nameFunc, "err:", err)
		switch {
		case errors.Is(err, file.ErrDirectoryNotStartsWithSlash):
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(shared.NewResponse(file.StatusDirectoryNotStartsWithSlash, err.Error(), nil))
		case errors.Is(err, file.ErrNotFound):
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(shared.NewResponse(file.StatusNotFound, err.Error(), nil))
		case errors.Is(err, file.ErrMLService):
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(shared.NewResponse(file.StatusMLService, err.Error(), nil))
		default:
			w.WriteHeader(http.StatusInternalServerError)
		}
		return
	}

	w.WriteHeader(http.StatusOK)

	filesDTO := []FileDTO{}
	for _, file := range files {
		var fileDTO FileDTO
		err = dto.Map(&fileDTO, &file)
		fileDTO.Size = file.Size.ToDTO()
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		filesDTO = append(filesDTO, fileDTO)
	}

	json.NewEncoder(w).Encode(shared.NewResponse(0, "", filesDTO))
}

func (h *Handler) Processed(w http.ResponseWriter, r *http.Request) {
	queryValues := r.URL.Query()
	fileType := queryValues.Get("file_type")
	dir := queryValues.Get("dir")
	options := file.FileOptionsV2{
		FileType:      file.FileType(fileType),
		Dir:           dir,
		Status:        "processed",
		FilesRequired: true,
		DirsRequired:  false,
		FirstNesting:  false,
	}
	files, err := h.usecase.ProccessedUploaded(r.Context(), options)

	if err != nil {
		log.Println("processed", "err:", err)
		switch {
		case errors.Is(err, file.ErrDirectoryNotStartsWithSlash):
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(shared.NewResponse(file.StatusDirectoryNotStartsWithSlash, err.Error(), nil))
		case errors.Is(err, file.ErrNotFound):
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(shared.NewResponse(file.StatusNotFound, err.Error(), nil))
		case errors.Is(err, file.ErrMLService):
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(shared.NewResponse(file.StatusMLService, err.Error(), nil))
		default:
			w.WriteHeader(http.StatusInternalServerError)
		}
		return
	}

	w.WriteHeader(http.StatusOK)

	filesDTO := []FileForMLDTO{}
	for _, file := range files {
		var fileDTO FileForMLDTO
		err = dto.Map(&fileDTO, &file)
		fileDTO.Size = file.Size.ToDTO()
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
		}
		filesDTO = append(filesDTO, fileDTO)
	}

	json.NewEncoder(w).Encode(shared.NewResponse(0, "", filesDTO))

	// h.responseFiles(r.Context(), w, files, err, "v2 proccessed")
}

func (h *Handler) Uploaded(w http.ResponseWriter, r *http.Request) {
	options := file.FileOptionsV2{
		Status:        "uploaded",
		FilesRequired: true,
		DirsRequired:  false,
		FirstNesting:  false,
	}
	files, err := h.usecase.ProccessedUploaded(r.Context(), options)
	h.responseFiles(r.Context(), w, files, err, "v2 processed")
}

func (h *Handler) Shared(w http.ResponseWriter, r *http.Request) {
	queryValues := r.URL.Query()
	dir := queryValues.Get("dir")
	options := file.FileOptionsV2{
		Dir:           dir,
		FirstNesting:  true,
		FilesRequired: true,
		DirsRequired:  true,
	}
	files, err := h.usecase.Shared(r.Context(), options)
	h.responseFiles(r.Context(), w, files, err, "v2 shared")
}

func (h *Handler) Drive(w http.ResponseWriter, r *http.Request) {
	queryValues := r.URL.Query()
	dir := queryValues.Get("dir")
	cloudEmail := queryValues.Get("cloud_email")
	options := file.FileOptionsV2{
		Dir:           dir,
		CloudEmail:    cloudEmail,
		FirstNesting:  true,
		FilesRequired: true,
		DirsRequired:  true,
	}
	files, err := h.usecase.Drive(r.Context(), options)
	h.responseFiles(r.Context(), w, files, err, "v2 drive")
}

func (h *Handler) Internal(w http.ResponseWriter, r *http.Request) {
	queryValues := r.URL.Query()
	dir := queryValues.Get("dir")
	options := file.FileOptionsV2{
		Dir:           dir,
		FirstNesting:  true,
		FilesRequired: true,
		DirsRequired:  true,
	}
	files, err := h.usecase.Internal(r.Context(), options)
	h.responseFiles(r.Context(), w, files, err, "v2 internal")
}

func (h *Handler) Search(w http.ResponseWriter, r *http.Request) {
	queryValues := r.URL.Query()
	fileType := queryValues.Get("file_type")
	dir := queryValues.Get("dir")
	smart := queryValues.Get("smart") == "true"
	query := queryValues.Get("query")
	options := file.FileOptionsV2{
		FileType:      file.FileType(fileType),
		Dir:           dir,
		Query:         query,
		Smart:         smart,
		FilesRequired: true,
		DirsRequired:  false,
		FirstNesting:  false,
	}
	files, err := h.usecase.SearchV2(r.Context(), options)
	h.responseFiles(r.Context(), w, files, err, "v2 search")
}

func (h *Handler) Dirs(w http.ResponseWriter, r *http.Request) {
	queryValues := r.URL.Query()
	query := queryValues.Get("query")
	options := file.FileOptionsV2{
		Query:         query,
		FilesRequired: false,
		DirsRequired:  true,
		FirstNesting:  false,
	}
	files, err := h.usecase.SearchV2(r.Context(), options)
	h.responseFiles(r.Context(), w, files, err, "v2 dirs")
}
