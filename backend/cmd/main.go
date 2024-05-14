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

	cloudDelivery "github.com/WindowsKonon1337/CleverSearch/internal/delivery/cloud"
	fileDelivery "github.com/WindowsKonon1337/CleverSearch/internal/delivery/file"
	"github.com/WindowsKonon1337/CleverSearch/internal/delivery/middleware"
	notifyDelivery "github.com/WindowsKonon1337/CleverSearch/internal/delivery/notifier"
	staticDelivery "github.com/WindowsKonon1337/CleverSearch/internal/delivery/static"
	userDelivery "github.com/WindowsKonon1337/CleverSearch/internal/delivery/user"
	cloudUsecase "github.com/WindowsKonon1337/CleverSearch/internal/usecase/cloud"
	fileUsecase "github.com/WindowsKonon1337/CleverSearch/internal/usecase/file"
	notifyUsecase "github.com/WindowsKonon1337/CleverSearch/internal/usecase/notifier"
	userUsecase "github.com/WindowsKonon1337/CleverSearch/internal/usecase/user"
)

// TODO:
// в доменную сущность поместился Conn *websocket.Conn
// конфиг файл
// контексты, таймауты
// метрики

// можно ли беку следить, как мл обрабатывает очередь ? нужно ли?

// конверт png, txt to jpg, pdf

// удаление sharing папки (??????????7)

// ручка на запрос статики

// нельзя добавлять в файлы, которые из интеграции внешней

// входит ли в зону ответственности usecase проверять context и доставать оттуда user?
// может быть, это стоит делать в delivery и передавать user в методы usecase явно через параметры?

// shared_dirs -> добавить author_id

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

	oauthConfig, err := cloudDelivery.NewDriveClient()
	if err != nil {
		return err
	}

	userRepo := user.NewRepository(mongoDB)
	fileRepo := file.NewRepository(minio, mongoDB, channelRabbitMQ)
	notifyGateway := notifier.NewGateway()

	notifyUsecase := notifyUsecase.NewUsecase(notifyGateway)
	userUsecase := userUsecase.NewUsecase(userRepo)
	fileUsecase := fileUsecase.NewUsecase(fileRepo, notifyUsecase, userUsecase)
	cloudUsecase := cloudUsecase.NewUsecase(oauthConfig, fileRepo, fileUsecase, userRepo)

	go fileUsecase.AsyncSendToQueue()

	staticHandler := staticDelivery.NewHandler(staticDir, fileUsecase)
	userHandler := userDelivery.NewHandler(userUsecase, cloudUsecase)
	fileHandler := fileDelivery.NewHandler(fileUsecase)
	notifyHandler := notifyDelivery.NewHandler(notifyUsecase)
	cloudHandler := cloudDelivery.NewHandler(oauthConfig, staticHandler, cloudUsecase)

	middleware := middleware.NewMiddleware(userUsecase)

	r := mux.NewRouter()
	headers := handlers.AllowedHeaders([]string{"Content-Type"})
	methods := handlers.AllowedMethods([]string{"GET", "POST"})
	// TODO: not secure
	origins := handlers.AllowedOrigins([]string{"*"})
	r.Use(handlers.CORS(headers, methods, origins))
	r.Use(middleware.AccessLogMiddleware)

	r.NotFoundHandler = http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log.Println("not found URL:", r.URL)
		w.WriteHeader(http.StatusBadRequest)
	})

	minioRouter := r.PathPrefix("/minio").Subrouter()
	minioRouter.Use(middleware.AuthMiddleware)

	// запрос на скачиваение файлы
	// TODO: nginx выполняет, т.к. bucket публичный
	minioRouter.HandleFunc("/{path:.*}", fileHandler.DownloadFile).Methods("GET")

	api := r.PathPrefix("/api").Subrouter()
	api.Use(middleware.AddJSONHeader)

	apiAuth := api.Methods("GET", "POST").Subrouter()
	apiAuth.Use(middleware.AuthMiddleware)

	filesMLRouter := api.Methods("GET").Subrouter()
	filesMLRouter.Use(middleware.GetUserIDMiddleware)
	// deprecated
	filesMLRouter.HandleFunc("/ml/files", fileHandler.GetFiles).Methods("GET")
	apiAuth.HandleFunc("/files", fileHandler.GetFiles).Methods("GET")
	apiAuth.HandleFunc("/files/search", fileHandler.GetFiles).Methods("GET")

	filesMLRouter.HandleFunc("/v2/files/processed", fileHandler.Processed).Methods("GET")
	apiAuth.HandleFunc("/v2/files/uploaded", fileHandler.Uploaded).Methods("GET")
	apiAuth.HandleFunc("/v2/files/shared", fileHandler.Shared).Methods("GET")
	apiAuth.HandleFunc("/v2/files/drive", fileHandler.Drive).Methods("GET")
	apiAuth.HandleFunc("/v2/files/internal", fileHandler.Internal).Methods("GET")
	apiAuth.HandleFunc("/v2/files/search", fileHandler.Search).Methods("GET")
	apiAuth.HandleFunc("/v2/files/dirs", fileHandler.Dirs).Methods("GET")

	apiAuth.HandleFunc("/files/upload", fileHandler.UploadFile).Methods("POST")
	apiAuth.HandleFunc("/files/delete", fileHandler.DeleteFiles).Methods("POST")

	apiAuth.HandleFunc("/files/favs", fileHandler.GetFavs).Methods("GET")
	apiAuth.HandleFunc("/files/favs/add/{file_uuid}", fileHandler.AddFav).Methods("POST")
	apiAuth.HandleFunc("/files/favs/delete/{file_uuid}", fileHandler.DeleteFav).Methods("POST")

	apiAuth.HandleFunc("/files/{file_uuid}", fileHandler.GetFileByID).Methods("GET")

	apiAuth.HandleFunc("/clouds/connect", cloudHandler.ConnectCloud).Methods("POST")
	apiAuth.HandleFunc("/clouds/callback", cloudHandler.AuthProviderCallback).Methods("GET")
	apiAuth.HandleFunc("/clouds/refresh", cloudHandler.RefreshCloud).Methods("POST")
	apiAuth.HandleFunc("/clouds/google/{cloud_email}/{cloud_file_id}", cloudHandler.GetCloudFile).Methods("GET")

	apiAuth.HandleFunc("/dirs/create", fileHandler.CreateDir).Methods("POST")
	apiAuth.HandleFunc("/dirs/share", fileHandler.ShareDir).Methods("POST")

	apiAuth.HandleFunc("/users/emails/check", userHandler.CheckEmails).Methods("POST")
	apiAuth.HandleFunc("/users/profile", userHandler.Profile).Methods("GET")
	api.HandleFunc("/users/logout", userHandler.Logout).Methods("POST")
	api.HandleFunc("/users/login", userHandler.Login).Methods("POST")
	api.HandleFunc("/users/register", userHandler.Register).Methods("POST")
	apiAuth.HandleFunc("/users/avatars", userHandler.AddAvatar).Methods("POST")
	apiAuth.HandleFunc("/users/avatars/{user_email}", userHandler.GetAvatar).Methods("GET")

	api.HandleFunc("/ml/complete", fileHandler.CompleteProcessingFile).Methods("POST")

	apiAuth.HandleFunc("/ws", notifyHandler.ConnectNotifications).Methods("GET")

	shareLinkRouter := r.Methods("GET").Subrouter()
	shareLinkRouter.Use(middleware.AuthMiddlewareSoft)
	shareLinkRouter.HandleFunc("/dirs/{dir_uuid}", staticHandler.GetShering).Methods("GET")

	r.PathPrefix("/").HandlerFunc(staticHandler.GetStatic)

	log.Println("listen on :8080")

	if err := http.ListenAndServe(":8080", r); err != nil {
		return err
	}
	return nil
}
