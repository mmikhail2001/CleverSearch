package file

import (
	"context"
	"fmt"
	"log"

	"github.com/WindowsKonon1337/CleverSearch/internal/delivery/shared"
	"github.com/WindowsKonon1337/CleverSearch/internal/domain/cleveruser"
	"github.com/WindowsKonon1337/CleverSearch/internal/domain/file"
	fileDomain "github.com/WindowsKonon1337/CleverSearch/internal/domain/file"
	"github.com/WindowsKonon1337/CleverSearch/internal/domain/sharederrors"
)

func (uc *Usecase) GetFavs(ctx context.Context) ([]file.File, error) {
	user, ok := ctx.Value(shared.UserContextName).(cleveruser.User)
	if !ok {
		log.Println(sharederrors.ErrUserNotFoundInContext.Error())
		return []fileDomain.File{}, sharederrors.ErrUserNotFoundInContext
	}
	return uc.repo.GetFavs(ctx, user.ID)
}

func (uc *Usecase) AddFav(ctx context.Context, fileID string) error {
	user, ok := ctx.Value(shared.UserContextName).(cleveruser.User)
	if !ok {
		log.Println(sharederrors.ErrUserNotFoundInContext.Error())
		return sharederrors.ErrUserNotFoundInContext
	}
	foundFile, err := uc.repo.GetFileByID(ctx, fileID)
	if err != nil {
		log.Println("AddFav: GetFileByID: err", err)
		return err
	}
	if foundFile.IsDir {
		log.Println("Dir wont be fav")
		return fmt.Errorf("dir wont be fav")

	}
	return uc.repo.AddFav(ctx, user.ID, fileID)
}

func (uc *Usecase) DeleteFav(ctx context.Context, fileID string) error {
	user, ok := ctx.Value(shared.UserContextName).(cleveruser.User)
	if !ok {
		log.Println(sharederrors.ErrUserNotFoundInContext.Error())
		return sharederrors.ErrUserNotFoundInContext
	}
	foundFile, err := uc.repo.GetFileByID(ctx, fileID)
	if err != nil {
		log.Println("DeleteFav: GetFileByID: err", err)
		return err
	}
	if foundFile.IsDir {
		log.Println("Dir wont be fav")
		return fmt.Errorf("dir wont be fav")
	}
	return uc.repo.DeleteFav(ctx, user.ID, fileID)
}
