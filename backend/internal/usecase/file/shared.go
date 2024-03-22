package file

import (
	"fmt"
	"strings"

	fileDomain "github.com/WindowsKonon1337/CleverSearch/internal/domain/file"
)

func filterFilesByNesting(files []fileDomain.File, dir string) []fileDomain.File {
	printPaths(files, "1 filterFilesByNesting")
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
	printPaths(files, "2 filterFilesByNesting")
	return filteredFiles
}

func printPaths(files []fileDomain.File, message string) {
	fmt.Println(message)
	for _, file := range files {
		fmt.Printf("%v\n", file.Path)
	}
	fmt.Printf("\n\n")
}
