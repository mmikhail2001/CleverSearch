package file

import (
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"net/url"

	"github.com/WindowsKonon1337/CleverSearch/internal/delivery/shared"
	"github.com/WindowsKonon1337/CleverSearch/internal/domain/cleveruser"
	"github.com/WindowsKonon1337/CleverSearch/internal/domain/file"
)

var APIServiceMLSearch = "http://mlcore:8081/search"

func (r *Repository) SmartSearch(ctx context.Context, fileOptions file.FileOptions) ([]file.File, error) {
	user, ok := ctx.Value(shared.UserContextName).(cleveruser.User)
	if !ok {
		return []file.File{}, fmt.Errorf("user not found in context")
	}

	queryParams := url.Values{}
	queryParams.Set("query", fileOptions.Query)
	queryParams.Set("file_type", string(fileOptions.FileType))
	queryParams.Set("dir", fileOptions.Dir)
	queryParams.Set("disk", string(fileOptions.Disk))
	queryParams.Set("user_id", user.ID)
	url := APIServiceMLSearch + "?" + queryParams.Encode()

	// http://mlcore:8081/search?query=serer&file_type=img&dir=/&user_id=user_id

	resp, err := http.Get(url)
	if err != nil {
		log.Println("http.Get error:", err)
		return nil, err
	}
	defer resp.Body.Close()

	bodyBytes, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		log.Println("ioutil.ReadAll error:", err)
		return nil, err
	}

	var response searchResponseDTO
	err = json.Unmarshal(bodyBytes, &response)
	if err != nil {
		log.Println("json.Unmarshal:", string(bodyBytes), ", error:", err)
		return nil, err
	}

	// filesMock, _ := r.GetFiles(ctx, file.FileOptions{
	// 	Limit: 3,
	// })
	// idsMock := []string{}
	// for _, file := range filesMock {
	// 	idsMock = append(idsMock, file.ID)
	// }

	// response := searchResponseDTO{
	// 	Body: Ids{
	// 		Ids: idsMock,
	// 	},
	// }

	var files []file.File
	for _, searchItem := range response.FilesID {
		file, err := r.GetFileByID(ctx, searchItem.FileID)
		if err != nil {
			log.Println("GetFileByID error:", err)
			return nil, err
		}
		files = append(files, file)
	}
	return files, nil
}
