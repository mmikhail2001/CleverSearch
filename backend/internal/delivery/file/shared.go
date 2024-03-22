package file

import (
	"context"
	"fmt"
	"strconv"

	"github.com/WindowsKonon1337/CleverSearch/internal/delivery/shared"
	"github.com/WindowsKonon1337/CleverSearch/internal/domain/cleveruser"
	"github.com/WindowsKonon1337/CleverSearch/internal/domain/file"
	"github.com/WindowsKonon1337/CleverSearch/internal/domain/sharederrors"
)

// https://stackoverflow.com/questions/23714383/what-are-all-the-possible-values-for-http-content-type-header

var fileTypeMap = map[string]file.FileType{
	"application/pdf": file.Text,
	"text/csv":        file.Text,
	"text/plain":      file.Text,

	"application/vnd.oasis.opendocument.text ":                                   file.Text,
	"application/vnd.oasis.opendocument.spreadshee":                              file.Text,
	"application/vnd.oasis.opendocument.presentation":                            file.Text,
	"application/vnd.ms-excel ":                                                  file.Text,
	"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":          file.Text,
	"application/vnd.ms-powerpoint ":                                             file.Text,
	"application/vnd.openxmlformats-officedocument.presentationml.presentation ": file.Text,
	"application/msword":                                                         file.Text,
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document":    file.Text,

	"audio/mpeg":  file.Audio,
	"audio/x-wav": file.Audio,

	"image/gif":  file.Image,
	"image/jpeg": file.Image,
	"image/png":  file.Image,

	"video/mpeg":      file.Video,
	"video/mp4":       file.Video,
	"video/quicktime": file.Video,
	"video/webm":      file.Video,
}

func setLimitOffset(value string, defaultValue int) (int, error) {
	if value == "" {
		return defaultValue, nil
	} else {
		valueInt, err := strconv.Atoi(value)
		if err != nil {
			return 0, fmt.Errorf("limit or offset is not integer: %w", err)
		} else {
			return valueInt, nil
		}
	}
}

func setUserEmailToFile(ctx context.Context, file FileDTO) (FileDTO, error) {
	user, ok := ctx.Value(shared.UserContextName).(cleveruser.User)
	if !ok {
		return file, sharederrors.ErrUserNotFoundInContext
	}
	file.Email = user.Email
	return file, nil
}
