package file

import (
	"context"
	"errors"
	"fmt"
	"log"
	"strings"

	"github.com/WindowsKonon1337/CleverSearch/internal/delivery/shared"
	"github.com/WindowsKonon1337/CleverSearch/internal/domain/cleveruser"
	"github.com/WindowsKonon1337/CleverSearch/internal/domain/file"
	fileDomain "github.com/WindowsKonon1337/CleverSearch/internal/domain/file"
	"github.com/WindowsKonon1337/CleverSearch/internal/domain/sharederrors"
)

func (uc *Usecase) GetFiles(ctx context.Context, options fileDomain.FileOptions) ([]fileDomain.File, error) {
	if options.Dir != "" && !strings.HasPrefix(options.Dir, "/") {
		log.Printf("Directory path [%s] does not start with /\n", options.Dir)
		return []fileDomain.File{}, fileDomain.ErrDirectoryNotStartsWithSlash
	}

	user, ok := ctx.Value(shared.UserContextName).(cleveruser.User)
	if !ok {
		log.Println(sharederrors.ErrUserNotFoundInContext.Error())
		return []fileDomain.File{}, sharederrors.ErrUserNotFoundInContext
	}

	options.UserID = user.ID

	if options.Dir == "" {
		options.Dir = "/"
	}
	if options.Status != fileDomain.StatusType("") {
		var files []fileDomain.File
		options.DirsRequired = false
		options.FirstNesting = false
		var resultsTmp []file.File
		options.CloudEmail = ""
		options.Disk = ""
		resultsTmp, err := uc.repo.GetFiles(ctx, options)
		if err != nil {
			log.Println("GetFiles: err:", err)
			return []fileDomain.File{}, err
		}
		files = append(files, resultsTmp...)
		for _, cloud := range user.ConnectedClouds {
			options.InternalDisklRequired = false
			options.Disk = string(cloud.Cloud)
			options.CloudEmail = cloud.CloudEmail
			resultsTmp, err := uc.repo.GetFiles(ctx, options)
			if err != nil {
				log.Println("GetFiles: err:", err)
				return []fileDomain.File{}, err
			}
			files = append(files, resultsTmp...)
		}
		return files, nil
	}

	// если имеется статус в параметрах, то отвечаем без папок, всеми файлами (внутренними, расшаренными, внешними)
	// кажется, что расшаренные здесь не возвратятся, т.к. выше options.UserID = user.ID
	if options.Status != fileDomain.StatusType("") {
		var files []fileDomain.File
		options.DirsRequired = false
		options.FirstNesting = false
		var resultsTmp []file.File
		options.CloudEmail = ""
		options.Disk = ""
		// запрос на все внутренние файлы
		resultsTmp, err := uc.repo.GetFiles(ctx, options)
		if err != nil {
			log.Println("GetFiles: err:", err)
			return []fileDomain.File{}, err
		}
		files = append(files, resultsTmp...)
		// запрос на все внешние файлы
		for _, cloud := range user.ConnectedClouds {
			options.InternalDisklRequired = false
			options.Disk = string(cloud.Cloud)
			options.CloudEmail = cloud.CloudEmail
			resultsTmp, err := uc.repo.GetFiles(ctx, options)
			if err != nil {
				log.Println("GetFiles: err:", err)
				return []fileDomain.File{}, err
			}
			files = append(files, resultsTmp...)
		}
		return files, nil
	}

	var files []fileDomain.File

	// если запрос на внешние, то обязательно нужно указать диск
	saveCloudEmail := options.CloudEmail

	if options.ExternalDisklRequired && options.CloudEmail != "" {
		filesExternal, err := uc.repo.GetFiles(ctx, options)
		if err != nil {
			log.Println("external requered, but cloud email is empty")
			return []fileDomain.File{}, err
		}
		if options.FirstNesting {
			files = append(files, filterFilesByNesting(filesExternal, options.Dir)...)
		} else {
			files = append(files, filesExternal...)
		}
		printPaths(files, "ExternalDisklRequired files:")
	}

	if options.InternalDisklRequired {
		options.CloudEmail = ""
		options.ExternalDisklRequired = false
	} else {
		return files, nil
	}

	// если путь корневой, то нужны (shared папки и все файлы и папки) данного пользователя
	if options.Dir == "/" {
		options.UserID = user.ID
		// ищем файлы пользователя
		if options.PersonalRequired {
			filesTmp, err := uc.repo.GetFiles(ctx, options)
			if err != nil && !errors.Is(err, file.ErrNotFound) {
				log.Println("GetFiles error:", err)
				return []fileDomain.File{}, err
			}
			files = append(files, filesTmp...)
		}

		// ищем директории, которыми с данным пользователем пошарены
		if options.SharedRequired {
			sharedDirs, err := uc.repo.GetSharedDirs(ctx, "", options.UserID, true)
			if err != nil && !errors.Is(err, file.ErrNotFound) {
				log.Println("GetSharedDirs error:", err)
				return []fileDomain.File{}, err
			}
			if !errors.Is(err, file.ErrNotFound) {
				for _, sharedDir := range sharedDirs {
					// достаем сами эти пошаренные директории
					// TODO: в GetSharedDirs у файлов нет автора, поэтому нужно отдельно по ID запрашивать
					sharedDirFull, err := uc.repo.GetFileByID(ctx, sharedDir.ID)
					if err != nil && !errors.Is(err, file.ErrNotFound) {
						log.Println("GetFiles error:", err)
						return []fileDomain.File{}, err
					}
					if options.DirsRequired && options.Status == "" && (options.FileType == "" || options.FileType == "all") {
						files = append(files, sharedDirFull)
					}
					options.UserID = ""
					tmpOptionsDir := options.Dir
					options.Dir = sharedDir.Path
					// достаем файлы из пошаренных директорий
					filesTmp, err := uc.repo.GetFiles(ctx, options)
					options.Dir = tmpOptionsDir

					if err != nil && !errors.Is(err, file.ErrNotFound) {
						log.Println("GetFiles error:", err)
						return []fileDomain.File{}, err
					}

					files = append(files, filesTmp...)
				}
			}
		}
		if options.FirstNesting {
			return filterFilesByNesting(files, options.Dir), nil
		}
		return files, nil
	}

	// если запрошен не корень, то нужно проверить, корневой каталог является расшаренным данному пользователю
	rootDir := strings.Split(options.Dir, "/")[1]
	_, err := uc.repo.GetSharedDirs(ctx, "/"+rootDir, user.ID, true)
	if err != nil && !errors.Is(err, file.ErrNotFound) {
		log.Println("GetSharedDir error:", err)
		return []fileDomain.File{}, err
	}
	if options.PersonalRequired && errors.Is(err, file.ErrNotFound) {
		options.UserID = user.ID
		files, err = uc.repo.GetFiles(ctx, options)
	}
	if options.SharedRequired && err == nil {
		options.UserID = ""
		files, err = uc.repo.GetFiles(ctx, options)

		options.ExternalDisklRequired = true
		options.CloudEmail = saveCloudEmail

		filesExternal, _ := uc.repo.GetFiles(ctx, options)
		files = append(files, filesExternal...)
		printPaths(files, "files:::")
	}
	if err != nil {
		log.Println("GetFiles error:", err)
		return []fileDomain.File{}, err
	}
	if options.FirstNesting {
		return filterFilesByNesting(files, options.Dir), nil
	}
	return files, nil
}

func (uc *Usecase) Search(ctx context.Context, options fileDomain.FileOptions) ([]fileDomain.File, error) {
	if !strings.HasPrefix(options.Dir, "/") {
		log.Printf("Directory path [%s] does not start with /\n", options.Dir)
		return []fileDomain.File{}, fmt.Errorf("directory path [%s] does not start with /", options.Dir)
	}

	if options.IsSmartSearch {
		filesSmartSearch, err := uc.repo.SmartSearch(ctx, options)
		printPaths(filesSmartSearch, "filesSmartSearch ===")
		return filesSmartSearch, err
	}

	var files []fileDomain.File

	if options.ExternalDisklRequired && options.CloudEmail != "" {
		filesExternal, err := uc.repo.GetFiles(ctx, options)
		if err != nil {
			log.Println("external requered, but cloud email is empty")
			return []fileDomain.File{}, err
		}
		files = append(files, filesExternal...)
	}

	if options.InternalDisklRequired {
		options.CloudEmail = ""
		options.ExternalDisklRequired = false
		filesTmp, err := uc.GetFiles(ctx, options)
		if err != nil && !errors.Is(err, file.ErrNotFound) {
			return []fileDomain.File{}, nil
		}

		files = append(files, filesTmp...)
	}

	var filteredFiles []fileDomain.File

	for _, file := range files {
		if strings.Contains(file.Filename, options.Query) {
			filteredFiles = append(filteredFiles, file)
		}
	}

	return filteredFiles, nil
}
