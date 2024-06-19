package file

import (
	"context"
	"log"
	"time"
)

func (uc *Usecase) AsyncSendToQueue() {
	ticker := time.NewTicker(1 * time.Minute)
	defer ticker.Stop()

	count := 0
	for range ticker.C {
		files, err := uc.repo.GetAllFiles()
		if err != nil {
			log.Println("Async: err", err)
			continue
		}

		countUploadedFiles := 0
		for _, file := range files {
			if file.TimeCreated.Before(time.Now().Add(-5*time.Minute)) && file.Status == "uploaded" {
				err := uc.repo.PublishMessage(context.Background(), file)
				if err != nil {
					log.Println("PublishMessage in async task: err", err)
				}
				countUploadedFiles++
			}
		}
		log.Printf("Async task [%d], number of files to be sent to the queue [%d]\n", count, countUploadedFiles)
		count = count + 1
	}
}
