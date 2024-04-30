package file

import (
	"context"
	"fmt"
	"log"
	"strings"

	"github.com/WindowsKonon1337/CleverSearch/internal/delivery/shared"
	"github.com/WindowsKonon1337/CleverSearch/internal/domain/cleveruser"
	"github.com/WindowsKonon1337/CleverSearch/internal/domain/file"
	fileDomain "github.com/WindowsKonon1337/CleverSearch/internal/domain/file"
	"github.com/WindowsKonon1337/CleverSearch/internal/domain/sharederrors"
)

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

func filterFilesByNesting(files []fileDomain.File, dir string) []fileDomain.File {
	filteredFiles := make([]fileDomain.File, 0)

	if dir != "/" {
		dir = dir + "/"
	}

	for _, file := range files {
		// Проверяем, что путь файла начинается с указанной директории и имеет только один уровень вложенности
		if strings.HasPrefix(file.Path, dir) && strings.Count(strings.TrimPrefix(file.Path, dir), "/") == 0 {
			filteredFiles = append(filteredFiles, file)
		}
	}
	return filteredFiles
}

func printPaths(files []fileDomain.File, message string) {
	fmt.Println(message)
	for _, file := range files {
		fmt.Printf("%v\n", file.Path)
	}
	fmt.Printf("\n\n")
}

func handleDirSetUser(ctx context.Context, options *fileDomain.FileOptionsV2) (cleveruser.User, error) {
	if options.Dir != "" && !strings.HasPrefix(options.Dir, "/") {
		log.Printf("Directory path [%s] does not start with /\n", options.Dir)
		return cleveruser.User{}, fileDomain.ErrDirectoryNotStartsWithSlash
	}
	user, ok := ctx.Value(shared.UserContextName).(cleveruser.User)
	if !ok {
		log.Println(sharederrors.ErrUserNotFoundInContext.Error())
		return cleveruser.User{}, sharederrors.ErrUserNotFoundInContext
	}

	options.UserID = user.ID

	if options.Dir == "" {
		options.Dir = "/"
	}

	return user, nil
}
