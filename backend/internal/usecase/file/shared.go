package file

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"log"
	"os"
	"os/exec"
	"path/filepath"
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

func getFileExtension(filename string) string {
	parts := strings.Split(filename, ".")
	if len(parts) > 1 {
		return parts[len(parts)-1]
	}
	return ""
}

func ConvertToPDF(ctx context.Context, reader io.Reader, file file.File) (io.Reader, int64, error) {
	tmpFile, err := os.CreateTemp("", "tempfile*."+file.Extension)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to create temporary file: %v", err)
	}
	defer os.Remove(tmpFile.Name())

	if _, err := io.Copy(tmpFile, reader); err != nil {
		return nil, 0, fmt.Errorf("failed to copy file contents to temporary file: %v", err)
	}
	tmpFile.Close()

	loPath, err := exec.LookPath("libreoffice")
	if err != nil {
		return nil, 0, fmt.Errorf("libreoffice not found: %v", err)
	}

	log.Println("tmpFile.Name() ===", tmpFile.Name())
	cmd := exec.CommandContext(ctx, loPath, "--headless", "--convert-to", "pdf", tmpFile.Name(), "--outdir", filepath.Dir(tmpFile.Name()))
	if err := cmd.Run(); err != nil {
		return nil, 0, fmt.Errorf("conversion to PDF failed: %v", err)
	}

	pdfFilePath := strings.TrimSuffix(tmpFile.Name(), filepath.Ext(tmpFile.Name())) + ".pdf"
	pdfFile, err := os.Open(pdfFilePath)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to open PDF file: %v", err)
	}
	defer pdfFile.Close()

	var buffer bytes.Buffer
	size, err := io.Copy(&buffer, pdfFile)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to copy PDF contents to buffer: %v", err)
	}

	if err := os.Remove(pdfFilePath); err != nil {
		return nil, 0, fmt.Errorf("failed to remove temporary PDF file: %v", err)
	}

	return &buffer, size, nil
}

func replaceExtension(fileName, newExtension string) string {
	parts := strings.Split(fileName, ".")
	if len(parts) > 1 {
		parts[len(parts)-1] = newExtension
		return strings.Join(parts, ".")
	}
	return fileName + "." + newExtension
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
