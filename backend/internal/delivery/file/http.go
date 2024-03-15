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
		log.Printf("Failed to parse file file from the body: %v\n", err)
		if errors.As(err, new(*http.MaxBytesError)) {
			log.Printf("The size exceeded the maximum size equal to %d mb: %v\n", limitSizeFile, err)
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(shared.NewResponse(0, file.ErrFileExceedsMaxSize.Error(), nil))
			return
		}
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
		log.Println(file.ErrContentTypeNotSet.Error())
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(shared.NewResponse(0, file.ErrContentTypeNotSet.Error(), nil))
		return
	}

	fileType, ok := fileTypeMap[contentType]
	if !ok {
		fileType = file.Unknown
	}

	fileUpload, err := h.usecase.Upload(r.Context(), f, file.File{
		Filename:    handler.Filename,
		Size:        handler.Size,
		Path:        dir + "/" + handler.Filename,
		ContentType: contentType,
		FileType:    fileType,
	})
	if err != nil {
		log.Println("Error Upload usecase:", err)
		switch {
		case errors.Is(err, file.ErrDirectoryNotStartsWithSlash) || errors.Is(err, file.ErrSubdirectoryNotFound) || errors.Is(err, file.ErrFileAlreadyExists):
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(shared.NewResponse(0, err.Error(), nil))
		default:
			w.WriteHeader(http.StatusInternalServerError)
		}
		return
	}
	var fileDTO FileDTO
	dto.Map(&fileDTO, &fileUpload)

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(shared.NewResponse(0, "", fileDTO))
}

func (h *Handler) DeleteFiles(w http.ResponseWriter, r *http.Request) {
	req := DeleteFilesDTO{}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Println("Failed to decode json files to delete", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	err := h.usecase.DeleteFiles(r.Context(), req.Files)
	if err != nil {
		log.Println("Error DeleteFiles usecase", err)
		switch {
		case errors.Is(err, file.ErrDirectoryNotStartsWithSlash) || errors.Is(err, file.ErrNotFound):
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(shared.NewResponse(0, err.Error(), nil))
		default:
			w.WriteHeader(http.StatusInternalServerError)
		}
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
		Status:        file.StatusType(queryValues.Get("status")),
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
			log.Println("search with empty query")
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(shared.NewResponse(0, file.ErrSearchWithEmptyQuery.Error(), nil))
			return
		}
		results, err = h.usecase.Search(r.Context(), options)
	} else {
		results, err = h.usecase.GetFiles(r.Context(), options)
	}

	if err != nil {
		log.Println("Error Search or GetFiles with:", err)
		switch {
		case errors.Is(err, file.ErrDirectoryNotStartsWithSlash) || errors.Is(err, file.ErrNotFound):
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(shared.NewResponse(0, err.Error(), nil))
		default:
			w.WriteHeader(http.StatusInternalServerError)
		}
		return
	}

	w.WriteHeader(http.StatusOK)

	filesDTO := []FileDTO{}
	for _, file := range results {
		var fileDTO FileDTO
		dto.Map(&fileDTO, &file)
		filesDTO = append(filesDTO, fileDTO)
	}

	json.NewEncoder(w).Encode(shared.NewResponse(0, "", filesDTO))
}

func (h *Handler) CreateDir(w http.ResponseWriter, r *http.Request) {
	dirPath := r.URL.Query().Get("dir_path")
	dir := file.File{
		Path: dirPath,
	}
	_, err := h.usecase.CreateDir(r.Context(), dir)
	if err != nil {
		log.Println("Error CreateDir:", err)
		switch {
		case errors.Is(err, file.ErrDirectoryNotSpecified) || errors.Is(err, file.ErrSubdirectoryNotFound) || errors.Is(err, file.ErrDirectoryNotStartsWithSlash) || errors.Is(err, file.ErrDirectoryAlreadyExists):
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(shared.NewResponse(0, err.Error(), nil))
		default:
			w.WriteHeader(http.StatusInternalServerError)
		}
		return
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
