package file

import (
	"context"
	"net/url"

	"github.com/mmikhail2001/test-clever-search/internal/domain/file"
)

var APIServiceMLSearch = "http://service-ml/search"

// TODO: обращение к сервису Поиска
// тот отдаст ID в mongoDB
func (r *Repository) SmartSearch(ctx context.Context, fileOptions file.FileOptions) ([]file.File, error) {
	queryParams := url.Values{}
	queryParams.Set("query", fileOptions.Query)
	queryParams.Set("file_type", string(fileOptions.FileType))
	queryParams.Set("dir", fileOptions.Dir)
	queryParams.Set("disk", string(fileOptions.Disk))
	url := APIServiceMLSearch + "?" + queryParams.Encode()
	_ = url

	// TODO: Mock реализация
	// resp, err := http.Get(url)
	// if err != nil {
	// 	return nil, err
	// }
	// defer resp.Body.Close()

	// var response SearchResponseDTO

	// err = json.NewDecoder(resp.Body).Decode(&response)
	// if err != nil {
	// 	return nil, err
	// }

	filesMock, _ := r.GetFiles(ctx, file.FileOptions{
		Limit: 3,
	})
	idsMock := []string{}
	for _, file := range filesMock {
		idsMock = append(idsMock, file.ID)
	}

	response := SearchResponseDTO{
		Body: struct {
			Ids []string `json:"ids"`
		}{
			Ids: idsMock,
		},
	}

	var files []file.File
	for _, id := range response.Body.Ids {
		file, err := r.GetFileByID(ctx, id)
		if err != nil {
			return nil, err
		}
		files = append(files, file)
	}
	return files, nil
}
