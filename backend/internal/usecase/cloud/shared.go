package cloud

import (
	"context"
	"fmt"
	"log"
	"strings"
	"time"

	"github.com/WindowsKonon1337/CleverSearch/internal/domain/cleveruser"
	"github.com/WindowsKonon1337/CleverSearch/internal/domain/file"
	fileDomain "github.com/WindowsKonon1337/CleverSearch/internal/domain/file"
	"github.com/google/uuid"
	"golang.org/x/oauth2"
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

func (uc *Usecase) getToken(ctx context.Context, cloudEmail string, disk file.DiskType, user cleveruser.User) (*oauth2.Token, error) {
	var token *oauth2.Token = nil
	for i, cloud := range user.ConnectedClouds {
		if cloud.CloudEmail == cloudEmail && cloud.Cloud == disk {
			token = &oauth2.Token{
				AccessToken:  cloud.Token.AccessToken,
				RefreshToken: cloud.Token.RefreshToken,
				TokenType:    cloud.Token.TokenType,
				Expiry:       cloud.Token.Expiry,
			}
			if token.Valid() {
				break
			}
			log.Println("Access token is invalid.")
			tokenSource := uc.oauthConfig.TokenSource(ctx, token)
			newToken, err := tokenSource.Token()
			if err != nil {
				log.Println("Failed to refresh token:", err)
				return nil, err
			}

			token = &oauth2.Token{
				AccessToken:  newToken.AccessToken,
				RefreshToken: newToken.RefreshToken,
				TokenType:    newToken.TokenType,
				Expiry:       newToken.Expiry,
			}
			user.ConnectedClouds[i].Token = token
			err = uc.userRepo.UpdateUser(ctx, user)
			if err != nil {
				log.Println("CreateUser with updated access token failed:", err)
				return nil, err
			}
			break
		}
	}
	if token == nil {
		return nil, fmt.Errorf("requested disk and cloudEmail not found")
	}
	return token, nil
}
