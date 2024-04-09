package cloud

import (
	"context"
	"fmt"
	"log"
	"strings"
	"time"

	"github.com/WindowsKonon1337/CleverSearch/internal/domain/cleveruser"
	fileDomain "github.com/WindowsKonon1337/CleverSearch/internal/domain/file"
	"github.com/google/uuid"
	"google.golang.org/api/drive/v3"
)

func (uc *Usecase) downloadAndUploadFiles(ctx context.Context, srv *drive.Service, files []fileDomain.File) {
	for _, file := range files {
		if file.IsDir {
			continue
		}
		fileReader, err := srv.Files.Get(file.CloudID).Download()
		if err != nil {
			log.Printf("Unable to download file %s: %v", file.Path, err)
			continue
		}

		_, err = uc.fileRepo.UploadToStorage(ctx, fileReader.Body, file)
		if err != nil {
			log.Printf("Failed to upload file %s to MinIO: %v", file.Path, err)
			continue
		}

		err = uc.fileRepo.PublishMessage(ctx, file)
		if err != nil {
			log.Println("PublishMessage repo error:", err)
			continue
		}
	}
}

func (uc *Usecase) fillFilesRecursively(ctx context.Context, srv *drive.Service, files []*drive.File, currentPath string, user cleveruser.User, cloudUserEmail string, fileList *[]fileDomain.File) {
	for _, file := range files {
		createdTime, err := time.Parse(time.RFC3339, file.CreatedTime)
		if err != nil {
			log.Println("Unable to parse created time:", err)
		}
		contentType := file.MimeType
		if contentType == "application/vnd.google-apps.folder" {
			contentType = ""
		}
		fileInfo := fileDomain.File{
			ID:          uuid.New().String(),
			CloudID:     file.Id,
			CloudEmail:  cloudUserEmail,
			Filename:    file.Name,
			Extension:   file.Name[strings.LastIndex(file.Name, ".")+1:],
			ContentType: contentType,
			TimeCreated: createdTime,
			Disk:        fileDomain.GoogleDrive,
			UserID:      user.ID,
			FileType:    uc.fileUsecase.GetFileTypeByContentType(file.MimeType),
			Path:        currentPath + "/" + file.Name,
			Bucket:      strings.Split(cloudUserEmail, "@")[0] + "---" + user.Bucket,
			IsDir:       file.MimeType == "application/vnd.google-apps.folder",
			Size:        file.Size,
		}

		if !fileInfo.IsDir {
			fileInfo.Link = fmt.Sprintf("https://www.googleapis.com/drive/v3/files/%s?alt=media", file.Id)
		}

		*fileList = append(*fileList, fileInfo)

		if fileInfo.IsDir {
			subFiles, err := srv.Files.List().Q("'" + file.Id + "' in parents").Fields("files(id, name, mimeType, createdTime, size)").Do()
			if err != nil {
				log.Printf("Unable to retrieve files in folder %s: %v", file.Name, err)
				continue
			}
			uc.fillFilesRecursively(ctx, srv, subFiles.Files, fileInfo.Path, user, cloudUserEmail, fileList)
		}
	}
}
