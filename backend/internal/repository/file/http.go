package file

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"

	"github.com/WindowsKonon1337/CleverSearch/internal/delivery/shared"
	"github.com/WindowsKonon1337/CleverSearch/internal/domain/cleveruser"
	"github.com/WindowsKonon1337/CleverSearch/internal/domain/file"
)

var APIServiceMLSearch = "http://mlcore/search"

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
	queryParams.Set("user_id", string(user.ID))
	url := APIServiceMLSearch + "?" + queryParams.Encode()

	resp, err := http.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var response searchResponseDTO

	err = json.NewDecoder(resp.Body).Decode(&response)
	if err != nil {
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
			return nil, err
		}
		files = append(files, file)
	}
	return files, nil
}
