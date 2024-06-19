package file

import (
	"context"
	"errors"
	"fmt"
	"log"

	"github.com/WindowsKonon1337/CleverSearch/internal/delivery/shared"
	"github.com/WindowsKonon1337/CleverSearch/internal/domain/cleveruser"
	"github.com/WindowsKonon1337/CleverSearch/internal/domain/file"
	fileDomain "github.com/WindowsKonon1337/CleverSearch/internal/domain/file"
	"github.com/WindowsKonon1337/CleverSearch/internal/domain/sharederrors"
	"github.com/google/uuid"
)

func (uc *Usecase) GetSharingLink(ctx context.Context, reqShare file.RequestToShare) (string, error) {
	user, ok := ctx.Value(shared.UserContextName).(cleveruser.User)
	if !ok {
		log.Println(sharederrors.ErrUserNotFoundInContext.Error())
		return "", sharederrors.ErrUserNotFoundInContext
	}

	file, err := uc.repo.GetFileByPath(ctx, reqShare.Path, user.ID)
	if err != nil {
		return "", err
	}
	file.IsShareByEmail = false

	if reqShare.ByEmails {
		file.IsShareByEmail = true
		for _, email := range reqShare.Emails {
			user, err := uc.userUsecase.GetUserByEmail(ctx, email)
			if err != nil {
				// TODO: если не найден email, нужно сообщать фронту о том, что пользователь не найден
				if !errors.Is(err, cleveruser.ErrUserNotFound) {
					return "", err
				}
			}
			_, err = uc.repo.GetSharedDir(ctx, file.ID, user.ID)
			if err != nil {
				if !errors.Is(err, fileDomain.ErrNotFound) {
					log.Println("GetSharedDir err:", err)
					return "", err
				}
				if errors.Is(err, fileDomain.ErrNotFound) {
					sharedDir := fileDomain.SharedDir{
						ID:          uuid.New().String(),
						FileID:      file.ID,
						UserID:      user.ID,
						Accepted:    false,
						ShareAccess: reqShare.ShareAccess,
						Path:        file.Path,
					}
					err = uc.repo.InsertSharedDir(ctx, sharedDir)
					if err != nil {
						log.Println("InsertSharedDir err:", err)
						return "", err
					}
				}
			}
		}
	}
	file.IsShared = true
	file.ShareLink = "/dirs/" + file.ID + "?sharing=true"
	file.ShareAccess = reqShare.ShareAccess
	uc.repo.Update(ctx, file)
	return file.ShareLink, nil
}

func (uc *Usecase) AddSheringGrant(ctx context.Context, fileID string) error {
	file, err := uc.repo.GetFileByID(ctx, fileID)
	if err != nil {
		log.Println("AddSheringGrant GetFileByID with error:", err)
		return err
	}
	if !file.IsShared {
		log.Println(fileDomain.ErrDirNotSharing.Error())
		return fileDomain.ErrDirNotSharing
	}
	user, ok := ctx.Value(shared.UserContextName).(cleveruser.User)
	if !ok {
		log.Println(sharederrors.ErrUserNotFoundInContext.Error())
		return sharederrors.ErrUserNotFoundInContext
	}
	// log.Println("fileID = ", fileID)
	// log.Println("userID = ", user.ID)

	if file.IsShareByEmail {
		sharedDir, err := uc.repo.GetSharedDir(ctx, fileID, user.ID)
		if err != nil {
			if errors.Is(err, fileDomain.ErrNotFound) {
				log.Println("access to the shared dir was not granted")
				return fmt.Errorf("access to the shared dir was not granted")
			}
			return err
		}
		if !sharedDir.Accepted {
			sharedDir.Accepted = true
			_, err := uc.repo.UpdateSharedDir(ctx, sharedDir)
			if err != nil {
				log.Println("UpdateSharedDir err:", err)
				return err
			}
		}
		return nil
	} else {
		_, err := uc.repo.GetSharedDir(ctx, fileID, user.ID)
		log.Println("GetSharedDir, err:", err)
		if err != nil {
			if errors.Is(err, fileDomain.ErrNotFound) {
				sharedDir := fileDomain.SharedDir{
					ID:          uuid.New().String(),
					FileID:      file.ID,
					UserID:      user.ID,
					Accepted:    true,
					ShareAccess: file.ShareAccess,
					Path:        file.Path,
				}
				err = uc.repo.InsertSharedDir(ctx, sharedDir)
				if err != nil {
					log.Println("InsertSharedDir err:", err)
					return err
				}
				return nil
			}
			log.Println("GetSharedDir err:", err)
			return err
		}
		log.Println("GetSharedDir, return nil")
		return nil
	}
	// return uc.repo.AddUserToSharingDir(ctx, file, user.ID, file.ShareAccess)
}
