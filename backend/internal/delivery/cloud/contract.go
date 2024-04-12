package cloud

import (
	"context"
	"net/http"

	"github.com/WindowsKonon1337/CleverSearch/internal/domain/file"
	"golang.org/x/oauth2"
)

type StaticHandler interface {
	GetStatic(w http.ResponseWriter, r *http.Request)
}

type Usecase interface {
	CloudConnect(ctx context.Context, token *oauth2.Token) error
	RefreshConnect(ctx context.Context, disk file.DiskType, cloudEmail string) error
}
