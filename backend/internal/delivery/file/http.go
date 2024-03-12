package file

import (
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"strings"

	"github.com/WindowsKonon1337/CleverSearch/internal/delivery/shared"
	"github.com/WindowsKonon1337/CleverSearch/internal/domain/file"
	"github.com/dranikpg/dto-mapper"
)

var (
	limitSizeFile int64 = 200 * 1024 * 1024
	defaultLimit  int   = 20
	defaultOffset int   = 0
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
	r.Body = http.MaxBytesReader(w, r.Body, limitSizeFile)
	f, handler, err := r.FormFile("file")
	if err != nil {
		if errors.As(err, new(*http.MaxBytesError)) {
			log.Printf("The size exceeded the maximum size equal to %d mb: %v\n", limitSizeFile, err)
			w.WriteHeader(http.StatusBadRequest)
			return
		}
		log.Printf("Failed to parse file file from the body: %v\n", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	defer f.Close()

	dir := r.FormValue("dir")
	log.Printf("Uploading: File: %+v, Dir: %+v\n", handler.Filename, dir)

	var contentType string
	if contentTypes, ok := handler.Header["Content-Type"]; ok && len(contentTypes) > 0 {
		contentType = contentTypes[0]
	} else {
		contentType = "unknown"
	}

	fileType, ok := fileTypeMap[contentType]
	if !ok {
		fileType = file.Unknown
	}

	file, err := h.usecase.Upload(r.Context(), f, file.File{
		Filename:    handler.Filename,
		Size:        handler.Size,
		Path:        dir + "/" + handler.Filename,
		ContentType: contentType,
		FileType:    fileType,
	})
	if err != nil {
		log.Println("Error Upload usecase:", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	var fileDTO FileDTO
	dto.Map(&fileDTO, &file)

	w.WriteHeader(http.StatusOK)

	response := shared.Response{
		Status: 0,
		Body:   fileDTO,
	}
	json.NewEncoder(w).Encode(response)
}

func (h *Handler) DeleteFiles(w http.ResponseWriter, r *http.Request) {
	req := DeleteFilesDTO{}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Println("Failed to decode json files to delete", err)
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	err := h.usecase.DeleteFiles(r.Context(), req.Files)
	if err != nil {
		log.Println("Error DeleteFiles usecase", err)
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	w.WriteHeader(http.StatusOK)
}

func (h *Handler) GetFiles(w http.ResponseWriter, r *http.Request) {
	queryValues := r.URL.Query()

	options := file.FileOptions{
		FileType:      file.FileType(queryValues.Get("file_type")),
		Dir:           queryValues.Get("dir"),
		Shared:        queryValues.Get("shared") == "true",
		OnlyDirs:      queryValues.Get("only_dirs") == "true",
		IsSmartSearch: queryValues.Get("is_smart_search") == "true",
		Disk:          file.DiskType(queryValues.Get("disk")),
		Query:         queryValues.Get("query"),
	}

	var err error
	options.Limit, err = setLimitOffset(queryValues.Get("limit"), defaultLimit)
	if err != nil {
		log.Println(err)
		w.WriteHeader(http.StatusInternalServerError)
	}
	options.Offset, err = setLimitOffset(queryValues.Get("offset"), defaultOffset)
	if err != nil {
		log.Println(err)
		w.WriteHeader(http.StatusInternalServerError)
	}

	var results []file.File
	if strings.Contains(r.URL.Path, "search") {
		if options.Query == "" {
			// TODO:
			log.Println("search with empty query")
			w.WriteHeader(http.StatusBadGateway)
			return
		}
		results, err = h.usecase.Search(r.Context(), options)
	} else {
		results, err = h.usecase.GetFiles(r.Context(), options)
	}

	if err != nil {
		log.Println("Error Search or GetFileswith:", err)
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	w.WriteHeader(http.StatusOK)

	filesDTO := []FileDTO{}
	for _, file := range results {
		var fileDTO FileDTO
		dto.Map(&fileDTO, &file)
		filesDTO = append(filesDTO, fileDTO)
	}

	response := shared.Response{
		Status: 0,
		Body:   filesDTO,
	}
	json.NewEncoder(w).Encode(response)
}

func (h *Handler) CreateDir(w http.ResponseWriter, r *http.Request) {
	dirPath := r.URL.Query().Get("dir_path")
	file := file.File{
		Path: dirPath,
	}
	_, err := h.usecase.CreateDir(r.Context(), file)
	if err != nil {
		log.Println("Error CreateDir:", err)
		w.WriteHeader(http.StatusInternalServerError)
	}
	w.WriteHeader(http.StatusOK)
}

func (h *Handler) CompleteProcessingFile(w http.ResponseWriter, r *http.Request) {
	uuidFile := r.URL.Query().Get("file_uuid")
	if uuidFile == "" {
		log.Println("CompleteProcessingFile uuid is empty")
		w.WriteHeader(http.StatusBadRequest)
	}
	err := h.usecase.CompleteProcessingFile(r.Context(), uuidFile)
	if err != nil {
		log.Println("CompleteProcessingFile error:", err)
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	w.WriteHeader(http.StatusOK)
}
