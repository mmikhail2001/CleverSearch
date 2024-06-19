package file

import (
	"context"
	"encoding/json"
	"io/ioutil"
	"log"
	"net/http"
	"net/url"
	"slices"
	"sort"
	"strings"

	"github.com/WindowsKonon1337/CleverSearch/internal/domain/file"
)

var apiServiceMLSearch = "http://mlcore_rec_service:8081/search"

func (r *Repository) SmartSearchV2(ctx context.Context, fileOptions file.FileOptionsV2) ([]file.File, error) {
	queryParams := url.Values{}
	queryParams.Set("query", fileOptions.Query)
	// queryParams.Set("file_type", string(fileOptions.FileType))

	if len(fileOptions.FileTypes) > 0 {
		types := make([]string, len(fileOptions.FileTypes))
		for i, fileType := range fileOptions.FileTypes {
			types[i] = string(fileType)
		}
		queryParams.Set("file_type", strings.Join(types, ","))
	}

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

	var filesGeneral []file.File
	if slices.Contains(fileOptions.FileTypes, file.Text) {
		var filesTmp []file.File
		for _, searchItem := range response.Text {
			fileTmp, err := r.GetFileByID(ctx, searchItem.FileID)
			if err != nil {
				log.Println("GetFileByID (Text) error:", err)
				return nil, err
			}
			fileTmp.PageNumber = searchItem.PageNumber
			fileTmp.CosSim = searchItem.CosSim
			filesTmp = append(filesTmp, fileTmp)
		}
		filesGeneral = append(filesGeneral, filesTmp...)
	}
	if slices.Contains(fileOptions.FileTypes, file.Image) {
		var filesTmp []file.File
		for _, searchItem := range response.Image {
			fileTmp, err := r.GetFileByID(ctx, searchItem.FileID)
			if err != nil {
				log.Println("GetFileByID (Image) error:", err)
				return nil, err
			}
			fileTmp.CosSim = searchItem.CosSim
			filesTmp = append(filesTmp, fileTmp)
		}
		filesGeneral = append(filesGeneral, filesTmp...)
	}
	if slices.Contains(fileOptions.FileTypes, file.Audio) {
		var filesTmp []file.File
		for _, searchItem := range response.Audio {
			fileTmp, err := r.GetFileByID(ctx, searchItem.FileID)
			if err != nil {
				log.Println("GetFileByID (Audio) error:", err)
				return nil, err
			}
			fileTmp.Timestart = searchItem.Timestart
			fileTmp.CosSim = searchItem.CosSim
			filesTmp = append(filesTmp, fileTmp)
		}
		filesGeneral = append(filesGeneral, filesTmp...)
	}
	if slices.Contains(fileOptions.FileTypes, file.Video) {
		var filesTmp []file.File
		for _, searchItem := range response.Video {
			fileTmp, err := r.GetFileByID(ctx, searchItem.FileID)
			if err != nil {
				log.Println("GetFileByID (Video) error:", err)
				return nil, err
			}
			fileTmp.Timestart = searchItem.Timestart
			fileTmp.CosSim = searchItem.CosSim
			filesTmp = append(filesTmp, fileTmp)
		}
		filesGeneral = append(filesGeneral, filesTmp...)
	}

	sort.Slice(filesGeneral, func(i, j int) bool {
		return filesGeneral[i].CosSim > filesGeneral[j].CosSim
	})

	return filesGeneral, nil
}
