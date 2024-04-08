package file

import (
	"encoding/json"
	"errors"
	"io"
	"log"
	"mime"
	"net/http"
	"path/filepath"
	"strings"

	"github.com/WindowsKonon1337/CleverSearch/internal/delivery/shared"
	"github.com/WindowsKonon1337/CleverSearch/internal/domain/file"
	"github.com/dranikpg/dto-mapper"
	"github.com/gorilla/mux"
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
			log.Printf("The size exceeded the maximum size equal to %d mb: %v\n", limitSizeFile/1024/1024, err)
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(shared.NewResponse(file.StatusFileExceedsMaxSize, file.ErrFileExceedsMaxSize.Error(), nil))
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
		json.NewEncoder(w).Encode(shared.NewResponse(file.StatusContentTypeNotSet, file.ErrContentTypeNotSet.Error(), nil))
		return
	}

	fileType := h.usecase.GetFileTypeByContentType(contentType)

	if dir != "/" {
		dir = dir + "/"
	}

	fileUpload, err := h.usecase.Upload(r.Context(), f, file.File{
		Filename:    handler.Filename,
		Size:        handler.Size,
		Path:        dir + handler.Filename,
		ContentType: contentType,
		FileType:    fileType,
	})
	if err != nil {
		log.Println("Error Upload usecase:", err)
		switch {
		case errors.Is(err, file.ErrDirectoryNotStartsWithSlash):
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(shared.NewResponse(file.StatusDirectoryNotStartsWithSlash, err.Error(), nil))
		case errors.Is(err, file.ErrSubdirectoryNotFound):
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(shared.NewResponse(file.StatusSubdirectoryNotFound, err.Error(), nil))
		case errors.Is(err, file.ErrFileAlreadyExists):
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(shared.NewResponse(file.StatusFileAlreadyExists, err.Error(), nil))
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
		case errors.Is(err, file.ErrDirectoryNotStartsWithSlash):
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(shared.NewResponse(file.StatusDirectoryNotStartsWithSlash, err.Error(), nil))
		case errors.Is(err, file.ErrNotFound):
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(shared.NewResponse(file.StatusNotFound, err.Error(), nil))
		default:
			w.WriteHeader(http.StatusInternalServerError)
		}
		return
	}
	w.WriteHeader(http.StatusOK)
}

func (h *Handler) GetFileByID(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)

	foundFile, err := h.usecase.GetFileByID(r.Context(), vars["file_uuid"])
	if err != nil {
		if errors.Is(err, file.ErrNotFound) {
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(shared.NewResponse(file.StatusNotFound, err.Error(), nil))
			return
		}
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	var fileDTO FileDTO
	dto.Map(&fileDTO, &foundFile)
	fileDTO, err = setUserEmailToFile(r.Context(), fileDTO)
	if err != nil {
		json.NewEncoder(w).Encode(shared.NewResponse(-1, err.Error(), nil))
		w.WriteHeader(http.StatusBadGateway)
	}
	json.NewEncoder(w).Encode(shared.NewResponse(0, "", fileDTO))
}

func (h *Handler) GetFiles(w http.ResponseWriter, r *http.Request) {
	queryValues := r.URL.Query()

	options := file.FileOptions{
		FileType:         file.FileType(queryValues.Get("file_type")),
		Dir:              queryValues.Get("dir"),
		FirstNesting:     queryValues.Get("first_nesting") == "true",
		DirsRequired:     queryValues.Get("dirs_required") == "true" || queryValues.Get("dirs_required") == "",
		FilesRequired:    queryValues.Get("files_required") == "true" || queryValues.Get("files_required") == "",
		SharedRequired:   queryValues.Get("shared_required") == "true" || queryValues.Get("shared_required") == "",
		PersonalRequired: queryValues.Get("personal_required") == "true" || queryValues.Get("personal_required") == "",
		IsSmartSearch:    queryValues.Get("is_smart_search") == "true",
		Disk:             file.DiskType(queryValues.Get("disk")),
		Query:            queryValues.Get("query"),
		Status:           file.StatusType(queryValues.Get("status")),
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

	if strings.Contains(r.URL.Path, "ml/files") {
		filesDTO := []FileForMLDTO{}
		for _, file := range results {
			var fileDTO FileForMLDTO
			err = dto.Map(&fileDTO, &file)
			if err != nil {
				w.WriteHeader(http.StatusInternalServerError)
			}
			filesDTO = append(filesDTO, fileDTO)
		}

		json.NewEncoder(w).Encode(shared.NewResponse(0, "", filesDTO))
		return
	}

	filesDTO := []FileDTO{}
	for _, file := range results {
		var fileDTO FileDTO
		err = dto.Map(&fileDTO, &file)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
		}
		fileDTO, err = setUserEmailToFile(r.Context(), fileDTO)
		if err != nil {
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(shared.NewResponse(-1, err.Error(), nil))
		}
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
		case errors.Is(err, file.ErrDirectoryNotSpecified):
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(shared.NewResponse(file.StatusDirectoryNotSpecified, err.Error(), nil))
		case errors.Is(err, file.ErrSubdirectoryNotFound):
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(shared.NewResponse(file.StatusSubdirectoryNotFound, err.Error(), nil))
		case errors.Is(err, file.ErrDirectoryNotStartsWithSlash):
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(shared.NewResponse(file.StatusDirectoryNotStartsWithSlash, err.Error(), nil))
		case errors.Is(err, file.ErrDirectoryAlreadyExists):
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(shared.NewResponse(file.StatusDirectoryAlreadyExists, err.Error(), nil))
		default:
			w.WriteHeader(http.StatusInternalServerError)
		}
		return
	}
	w.WriteHeader(http.StatusOK)
}

func (h *Handler) DownloadFile(w http.ResponseWriter, r *http.Request) {
	path := r.URL.Path[len("/minio"):]
	fileReader, err := h.usecase.DownloadFile(r.Context(), path)
	if err != nil {
		log.Println("filepath [", path, "] not found:", err)
		w.WriteHeader(http.StatusNotFound)
		return
	}
	defer fileReader.Close()

	contentType := mime.TypeByExtension(filepath.Ext(path))
	if contentType == "" {
		contentType = "application/octet-stream"
	}

	w.Header().Set("Content-Type", contentType)

	if _, err := io.Copy(w, fileReader); err != nil {
		log.Println("error copy fileReader to w:", err)
		w.WriteHeader(http.StatusInternalServerError)
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

func (h *Handler) ShareDir(w http.ResponseWriter, r *http.Request) {
	req := RequestToShareDTO{}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Println("Failed to decode json request to share", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	var reqShare file.RequestToShare
	dto.Map(&reqShare, &req)

	shareLink, err := h.usecase.GetSharingLink(r.Context(), reqShare)
	if err != nil {
		log.Println("Error ShareDir usecase", err)
		// TODO: cleveruser.ErrUserNotFound, как-то надо сообщать, каких пользователей найти не удалось
		// не давать доступ всем или только тем, кого не нашли
		if errors.Is(err, file.ErrNotFound) {
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(shared.NewResponse(file.StatusNotFound, err.Error(), nil))
		}
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(shared.NewResponse(0, "", ResponseShareLinkDTO{ShareLink: shareLink}))
}
