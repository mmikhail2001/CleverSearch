package cloud

import (
	"context"
	"encoding/base32"
	"fmt"
	"io"
	"log"
	"strings"
	"time"

	"github.com/WindowsKonon1337/CleverSearch/internal/domain/cleveruser"
	fileDomain "github.com/WindowsKonon1337/CleverSearch/internal/domain/file"
	"github.com/google/uuid"
	"google.golang.org/api/drive/v3"
)

func printPaths(files []fileDomain.File, message string) {
	fmt.Println(message)
	for _, file := range files {
		fmt.Printf("%v\n", file.Path)
	}
	fmt.Printf("\n\n")
}

func replaceExtension(fileName, newExtension string) string {
	parts := strings.Split(fileName, ".")
	if len(parts) > 1 {
		parts[len(parts)-1] = newExtension
		return strings.Join(parts, ".")
	}
	return fileName + "." + newExtension
}

func (uc *Usecase) downloadAndUploadFiles(ctx context.Context, srv *drive.Service, files []fileDomain.File) {
	for _, file := range files {
		if file.IsDir {
			err := uc.fileRepo.CreateFile(ctx, file)
			if err != nil {
				log.Printf("Failed to CreateFile file %s in mongo, err: %v", file.Path, err)
				continue
			}
			continue
		}
		fileReader, err := srv.Files.Get(file.CloudID).Download()
		if err != nil {
			log.Printf("Unable to download file %s: %v", file.Path, err)
			continue
		}

		isExtValid := false
		switch file.Extension {
		case "doc", "docx", "odt", "ppt", "pptx", "odp", "txt", "md", "pdf", "mp3", "mp4", "jpeg", "jpg", "png":
			isExtValid = true
		}

		if !isExtValid {
			log.Printf("Extension file [ %s ] in google not valid", file.Extension)
			continue
		}

		converted := false
		var fileReaderConverted io.Reader
		switch file.Extension {
		case "doc", "docx", "odt", "ppt", "pptx", "odp", "txt", "md":
			var size int64
			fileReaderConverted, size, err = uc.fileUsecase.ConvertToPDF(ctx, fileReader.Body, file)
			if err != nil {
				log.Println("ConvertToPDF [file: ", file.Path, "] error:", err)
				continue
			}
			converted = true
			file.Extension = "pdf"
			file.Size = fileDomain.SizeType(size)
			file.Path = replaceExtension(file.Path, "pdf")
			file.Filename = replaceExtension(file.Filename, "pdf")
			file.Link = fmt.Sprintf("/minio/%s/%s", file.Bucket, file.Path)
			file.ConvertedToPDF = true
			file.ContentType = "application/pdf"
			// file.Link = replaceExtension(file.Link, "pdf")
			file.FileType = fileDomain.Text
		}

		err = uc.fileRepo.CreateFile(ctx, file)
		if err != nil {
			log.Printf("Failed to CreateFile file %s in mongo, err: %v", file.Path, err)
			continue
		}

		if converted {
			_, err = uc.fileRepo.UploadToStorage(ctx, fileReaderConverted, file)
			if err != nil {
				log.Printf("Failed to upload file %s to MinIO: %v", file.Path, err)
				continue
			}
		} else {
			_, err = uc.fileRepo.UploadToStorage(ctx, fileReader.Body, file)
			if err != nil {
				log.Printf("Failed to upload file %s to MinIO: %v", file.Path, err)
				continue
			}
		}

		file.Status = "uploaded"
		err = uc.fileRepo.Update(ctx, file)
		if err != nil {
			log.Println("Failed to update status file after download from google, file path:", file.Path, "err: ", err)
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
			Email:       user.Email,
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
			// Bucket:      strings.Split(cloudUserEmail, "@")[0] + "---" + user.Bucket,
			Bucket: strings.ToLower(base32.StdEncoding.EncodeToString([]byte(cloudUserEmail))),
			IsDir:  file.MimeType == "application/vnd.google-apps.folder",
			Size:   fileDomain.SizeType(file.Size),
		}

		if !fileInfo.IsDir {
			fileInfo.Link = fmt.Sprintf("/api/clouds/google/%s/%s", cloudUserEmail, file.Id)
			// fileInfo.Link = fmt.Sprintf("https://www.googleapis.com/drive/v3/files/%s?alt=media", file.Id)
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
