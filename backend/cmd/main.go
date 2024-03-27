package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/WindowsKonon1337/CleverSearch/internal/repository/file"
	"github.com/WindowsKonon1337/CleverSearch/internal/repository/notifier"
	"github.com/WindowsKonon1337/CleverSearch/internal/repository/user"
	"github.com/WindowsKonon1337/CleverSearch/pkg/client/minio"
	"github.com/WindowsKonon1337/CleverSearch/pkg/client/mongo"
	"github.com/WindowsKonon1337/CleverSearch/pkg/client/rabbitmq"
	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"

	fileDelivery "github.com/WindowsKonon1337/CleverSearch/internal/delivery/file"
	"github.com/WindowsKonon1337/CleverSearch/internal/delivery/middleware"
	notifyDelivery "github.com/WindowsKonon1337/CleverSearch/internal/delivery/notifier"
	staticDelivery "github.com/WindowsKonon1337/CleverSearch/internal/delivery/static"
	userDelivery "github.com/WindowsKonon1337/CleverSearch/internal/delivery/user"
	fileUsecase "github.com/WindowsKonon1337/CleverSearch/internal/usecase/file"
	notifyUsecase "github.com/WindowsKonon1337/CleverSearch/internal/usecase/notifier"
	userUsecase "github.com/WindowsKonon1337/CleverSearch/internal/usecase/user"
)

// TODO:
// нужный ws.conn должен выбираться исходя из cookie пользователя (сейчас заглушка userID = 1)
// не работает ограничение на размер файла
// в доменную сущность поместился Conn *websocket.Conn
// конфиг файл
// контексты, таймауты

// можно ли беку следить, как мл обрабатывает очередь ? нужно ли?
// (не замечал больше) если в поле директории указать /dir, то 2024/03/04 21:49:12 Failed to PutObject minio: Object name contains unsupported characters.

// имеет смысл разделить репозиторий на fileStorage, db....

// ручка getFiles - общее количество файлов (limit)
// ручка поиск - общее количестов + поиск в рамках директории + остальные фильтры

// кривое выделение текста в pdf

// ava позже

// конверт png, txt to jpg, pdf
// response search

var staticDir string = "/app/frontend/build"
var staticDirMinio string = "/app/minio_files"

func main() {

	if err := Run(); err != nil {
		fmt.Println("Error: ", err)
	}
}

func Run() error {
	log.SetFlags(log.LstdFlags | log.Llongfile)

	log.Println("start init")

	minio, err := minio.NewClient()
	if err != nil {
		return err
	}

	log.Println("minio connected")

	mongoDB, err := mongo.NewClient()
	if err != nil {
		return err
	}

	log.Println("mongo connected")

	channelRabbitMQ, err := rabbitmq.NewClient()
	if err != nil {
		return err
	}

	log.Println("rabbitMQ connected")

	userRepo := user.NewRepository(mongoDB)
	fileRepo := file.NewRepository(minio, mongoDB, channelRabbitMQ)
	notifyGateway := notifier.NewGateway()

	userUsecase := userUsecase.NewUsecase(userRepo)
	notifyUsecase := notifyUsecase.NewUsecase(notifyGateway)
	fileUsecase := fileUsecase.NewUsecase(fileRepo, notifyUsecase, userUsecase)

	staticHandler := staticDelivery.NewHandler(staticDir, fileUsecase)
	userHandler := userDelivery.NewHandler(userUsecase)
	fileHandler := fileDelivery.NewHandler(fileUsecase)
	notifyDelivery := notifyDelivery.NewHandler(notifyUsecase)

	middleware := middleware.NewMiddleware(userUsecase)

	r := mux.NewRouter()
	headers := handlers.AllowedHeaders([]string{"Content-Type"})
	methods := handlers.AllowedMethods([]string{"GET", "POST"})
	origins := handlers.AllowedOrigins([]string{"*"})
	r.Use(handlers.CORS(headers, methods, origins))
	r.Use(middleware.AccessLogMiddleware)

	r.NotFoundHandler = http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log.Println("not found URL:", r.URL)
		w.WriteHeader(http.StatusBadRequest)
	})

	minioRouter := r.PathPrefix("/minio").Subrouter()
	minioRouter.Use(middleware.AuthMiddleware)
	minioRouter.HandleFunc("/{path:.*}", fileHandler.DownloadFile).Methods("GET")

	api := r.PathPrefix("/api").Subrouter()
	api.Use(middleware.AddJSONHeader)

	apiAuth := api.Methods("GET", "POST").Subrouter()
	apiAuth.Use(middleware.AuthMiddleware)

	apiAuth.HandleFunc("/files", fileHandler.GetFiles).Methods("GET")
	apiAuth.HandleFunc("/files/search", fileHandler.GetFiles).Methods("GET")
	apiAuth.HandleFunc("/files/upload", fileHandler.UploadFile).Methods("POST")
	apiAuth.HandleFunc("/files/delete", fileHandler.DeleteFiles).Methods("POST")
	apiAuth.HandleFunc("/files/{file_uuid}", fileHandler.GetFileByID).Methods("GET")

	apiAuth.HandleFunc("/dirs/create", fileHandler.CreateDir).Methods("POST")

	apiAuth.HandleFunc("/dirs/share", fileHandler.ShareDir).Methods("POST")

	apiAuth.HandleFunc("/users/profile", userHandler.Profile).Methods("GET")

	api.HandleFunc("/users/logout", userHandler.Logout).Methods("POST")
	api.HandleFunc("/users/login", userHandler.Login).Methods("POST")
	api.HandleFunc("/users/register", userHandler.Register).Methods("POST")

	api.HandleFunc("/ml/complete", fileHandler.CompleteProcessingFile).Methods("POST")

	filesMLRouter := api.Methods("GET").Subrouter()
	filesMLRouter.Use(middleware.GetUserIDMiddleware)
	filesMLRouter.HandleFunc("/ml/files", fileHandler.GetFiles).Methods("GET")

	apiAuth.HandleFunc("/ws", notifyDelivery.ConnectNotifications).Methods("GET")

	shareLinkRouter := r.Methods("GET").Subrouter()
	shareLinkRouter.Use(middleware.AuthMiddleware)
	shareLinkRouter.HandleFunc("/dirs/{dir_uuid}", staticHandler.GetShering).Methods("GET")

	r.PathPrefix("/").HandlerFunc(staticHandler.GetStatic)

	log.Println("listen on :8080")

	if err := http.ListenAndServe(":8080", r); err != nil {
		return err
	}
	return nil
}