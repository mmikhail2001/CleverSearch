package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/gorilla/mux"
	"github.com/mmikhail2001/test-clever-search/internal/repository/file"
	"github.com/mmikhail2001/test-clever-search/internal/repository/notifier"
	"github.com/mmikhail2001/test-clever-search/pkg/client/minio"
	"github.com/mmikhail2001/test-clever-search/pkg/client/mongo"
	"github.com/mmikhail2001/test-clever-search/pkg/client/rabbitmq"

	fileDelivery "github.com/mmikhail2001/test-clever-search/internal/delivery/file"
	"github.com/mmikhail2001/test-clever-search/internal/delivery/middleware"
	notifyDelivery "github.com/mmikhail2001/test-clever-search/internal/delivery/notifier"
	fileUsecase "github.com/mmikhail2001/test-clever-search/internal/usecase/file"
	notifyUsecase "github.com/mmikhail2001/test-clever-search/internal/usecase/notifier"
)

// TODO:
// нужный ws.conn должен выбираться исходя из cookie пользователя (сейчас заглушка userID = 1)
// бд пользователей, авторизация
// repository vs gateway - система рассылки уведомлений
// не работает ограничение на размер файла
// в доменную сущность поместился Conn   *websocket.Conn
// конфиг файл
// контексты, таймауты

// нужна заглушка для python ML, прочитывание сообщений, sleep, webhook
// зачем UUID вообще конвертить в uuid.UUID
// может статуса в бд числовыми сделать (а не строка?...) и еще нужно статусы синхронизовать с event

// можно ли беку следить, как мл обрабатывает очередь ? нужно ли?
// если в поле директории указать /dir, то 2024/03/04 21:49:12 Failed to PutObject minio: Object name contains unsupported characters.
// - проблема в / в начале

var staticDir string = "../frontend"

func main() {

	if err := Run(); err != nil {
		fmt.Println("Error: ", err)
	}
}

func Run() error {
	log.SetFlags(log.LstdFlags | log.Llongfile)

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

	fileRepo := file.NewRepository(minio, mongoDB, channelRabbitMQ)
	notifyGateway := notifier.NewGateway()

	notifyUsecase := notifyUsecase.NewUsecase(notifyGateway)
	fileUsecase := fileUsecase.NewUsecase(fileRepo, notifyUsecase)

	fileHandler := fileDelivery.NewHandler(fileUsecase)
	notifyDelivery := notifyDelivery.NewHandler(notifyUsecase)

	r := mux.NewRouter()
	middleware := middleware.NewMiddleware()
	r.Use(middleware.AddJSONHeader)

	api := r.PathPrefix("/api").Subrouter()
	api.HandleFunc("/files", fileHandler.GetFiles).Methods("GET")
	api.HandleFunc("/files/search", fileHandler.GetFiles).Methods("GET")
	api.HandleFunc("/files/upload", fileHandler.UploadFile).Methods("POST")
	api.HandleFunc("/ml/complete", fileHandler.CompleteProcessingFile).Methods("GET")
	api.HandleFunc("/ws", notifyDelivery.ConnectNotifications).Methods("GET")

	fileServer := http.FileServer(http.Dir(staticDir))
	r.PathPrefix("/").HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if _, err := os.Stat(staticDir + r.URL.Path); err != nil {
			http.ServeFile(w, r, staticDir+"/index.html")
		} else {
			fileServer.ServeHTTP(w, r)
		}
	})

	log.Println("listen on :8080")

	if err := http.ListenAndServe(":8080", r); err != nil {
		return err
	}
	return nil
}
