package file

import (
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"net/url"

	"github.com/WindowsKonon1337/CleverSearch/internal/domain/file"
)

var apiServiceMLSearch = "http://mlcore:8081/search"

func (r *Repository) SmartSearchV2(ctx context.Context, fileOptions file.FileOptionsV2) ([]file.File, error) {
	queryParams := url.Values{}
	queryParams.Set("query", fileOptions.Query)
	queryParams.Set("file_type", string(fileOptions.FileType))
	queryParams.Set("dir", fileOptions.Dir)
	queryParams.Set("user_id", fileOptions.UserID)
	url := apiServiceMLSearch + "?" + queryParams.Encode()

	log.Println("url =====", url)

	resp, err := http.Get(url)
	if err != nil {
		log.Println("http.Get error:", err)
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		switch resp.StatusCode {
		case http.StatusBadRequest | http.StatusInternalServerError:
			log.Println("HTTP ML error:", resp.StatusCode)
			return []file.File{}, file.ErrMLService
		default:
			log.Println("HTTP ML Unknown error:", resp.StatusCode)
			return []file.File{}, file.ErrMLService
		}
	}

	bodyBytes, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		log.Println("ioutil.ReadAll error:", err)
		return nil, err
	}

	log.Println("from ML :", string(bodyBytes))

	var response searchResponseDTO
	err = json.Unmarshal(bodyBytes, &response)
	if err != nil {
		log.Println("json.Unmarshal:", string(bodyBytes), ", error:", err)
		return nil, err
	}

	var files []file.File
	if fileOptions.FileType == file.Text {
		for _, searchItem := range response.Text {
			file, err := r.GetFileByID(ctx, searchItem.FileID)
			if err != nil {
				log.Println("GetFileByID (Text) error:", err)
				return nil, err
			}
			file.PageNumber = searchItem.PageNumber
			files = append(files, file)
		}
		return files, nil
	}
	if fileOptions.FileType == file.Image {
		for _, searchItem := range response.Image {
			file, err := r.GetFileByID(ctx, searchItem.FileID)
			if err != nil {
				log.Println("GetFileByID (Image) error:", err)
				return nil, err
			}
			files = append(files, file)
		}
		return files, nil
	}
	if fileOptions.FileType == file.Audio {
		for _, searchItem := range response.Audio {
			file, err := r.GetFileByID(ctx, searchItem.FileID)
			if err != nil {
				log.Println("GetFileByID (Audio) error:", err)
				return nil, err
			}
			file.Timestart = searchItem.Timestart
			files = append(files, file)
		}
		return files, nil
	}
	if fileOptions.FileType == file.Video {
		for _, searchItem := range response.Video {
			file, err := r.GetFileByID(ctx, searchItem.FileID)
			if err != nil {
				log.Println("GetFileByID (Video) error:", err)
				return nil, err
			}
			file.Timestart = searchItem.Timestart
			files = append(files, file)
		}
		return files, nil
	}
	return []file.File{}, fmt.Errorf("file type response from ml not correct")
}
