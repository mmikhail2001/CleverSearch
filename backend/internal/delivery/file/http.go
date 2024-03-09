package file

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"
	"strings"

	"github.com/mmikhail2001/test-clever-search/internal/delivery/shared"
	"github.com/mmikhail2001/test-clever-search/internal/domain/file"
)

type Handler struct {
	usecase Usecase
}

func NewHandler(usecase Usecase) *Handler {
	return &Handler{
		usecase: usecase,
	}
}

func (h *Handler) UploadFile(w http.ResponseWriter, r *http.Request) {
	// TODO: это не работает
	// смог загрузить файл 500 МБ
	err := r.ParseMultipartForm(30 << 20)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	f, handler, err := r.FormFile("file")
	if err != nil {
		http.Error(w, "Error retrieving the file", http.StatusBadRequest)
		return
	}
	defer f.Close()

	dir := r.FormValue("dir")

	log.Printf("Uploaded File: %+v\n", handler.Filename)

	err = h.usecase.Upload(r.Context(), file.File{
		File:     f,
		Filename: handler.Filename,
		Size:     handler.Size,
		// TODO: мидлвара поместить User в context, оттуда берем
		UserID:      "1",
		Path:        dir + "/" + handler.Filename,
		ContentType: handler.Header["Content-Type"][0],
	})

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
	}
	w.WriteHeader(http.StatusOK)
}

func (h *Handler) GetFiles(w http.ResponseWriter, r *http.Request) {
	queryValues := r.URL.Query()

	options := file.FileOptions{
		FileType:      file.FileType(queryValues.Get("file_type")),
		Dir:           queryValues.Get("dir"),
		Shared:        queryValues.Get("shared") == "true",
		IsSmartSearch: queryValues.Get("is_smart_search") == "true",
		Disk:          file.DiskType(queryValues.Get("disk")),
		Query:         queryValues.Get("query"),
	}

	var err error
	options.Limit, err = setLimitOffset(queryValues.Get("limit"))
	if err != nil {
		log.Println(err)
		w.WriteHeader(http.StatusInternalServerError)
	}
	options.Offset, err = setLimitOffset(queryValues.Get("offset"))
	if err != nil {
		log.Println(err)
		w.WriteHeader(http.StatusInternalServerError)
	}

	var results []file.File
	if strings.Contains(r.URL.Path, "search") {
		if options.Query != "" {
			log.Println("search with empty query")
			w.WriteHeader(http.StatusInternalServerError)
		}
		results, err = h.usecase.Search(r.Context(), options)
	} else {
		results, err = h.usecase.GetFiles(r.Context(), options)
	}

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)

	filesDTO := []FileDTO{}
	for _, file := range results {
		filesDTO = append(filesDTO, FileDTO{
			ID:          file.ID,
			Filename:    file.Filename,
			UserID:      file.UserID,
			Path:        file.Path,
			IsShared:    false,
			DateCreated: file.TimeCreated,
			IsDir:       file.IsDir,
			Size:        strconv.Itoa(int(file.Size)),
			ContentType: file.ContentType,
			Extension:   file.Extension,
			Status:      file.Status,
			S3URL:       file.S3URL,
		})
	}

	response := shared.Response{
		Status: 0,
		Body:   filesDTO,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func (h *Handler) CompleteProcessingFile(w http.ResponseWriter, r *http.Request) {
	uuidFile := r.URL.Query().Get("file_uuid")
	if uuidFile == "" {
		log.Println(w, "CompleteProcessingFile uuid is empty")
		w.WriteHeader(http.StatusBadRequest)
	}
	err := h.usecase.CompleteProcessingFile(r.Context(), uuidFile)
	if err != nil {
		log.Println(w, "CompleteProcessingFile error:", err)
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	w.WriteHeader(http.StatusOK)
}
