package file

import (
	"context"
	"errors"
	"log"
	"strings"

	"github.com/WindowsKonon1337/CleverSearch/internal/domain/file"
	fileDomain "github.com/WindowsKonon1337/CleverSearch/internal/domain/file"
)

// only files
// status = processed
/*
	- вызвать Shared 	(DirsRequired = false, 		FilesRequired = true, 	status != "")
	- вызвать Drive 	(DirsRequired = false, 		FilesRequired = true, 	status != "")
	- вызвать Internal 	(DirsRequired = false, 		FilesRequired = true, 	status != "")
*/

func (uc *Usecase) ProccessedUploaded(ctx context.Context, options fileDomain.FileOptionsV2) ([]fileDomain.File, error) {
	_, err := handleDirSetUser(ctx, &options)
	if err != nil {
		return []fileDomain.File{}, err
	}
	var files []fileDomain.File

	// options.IgnoreCloudEmail = true
	// if options.Status == file.Processed {
	// 	for _, fileType := range options.FileTypes {
	// 		options.FileType = fileType
	// 		options.FileType = fileType
	files, err = uc.SharedDriveInternal(ctx, options)
	if err != nil && !errors.Is(err, file.ErrNotFound) {
		return []fileDomain.File{}, err
	}
	// 	files = append(files, filesTmp...)
	// }
	// } else {
	// 	return uc.SharedDriveInternal(ctx, options)
	// }
	return files, nil
}

// files + dirs + firstNesting
/*
	если dir = /
		- запрос на все расшаренные
		- запрос на все файлы (И ПАПКИ) внутри этих расшаренных папок
	если dir != /
		- поиск расшаренной папки dir[0]
		- если расшарена, то запрос на все файлы (И ПАПКИ) внутри этой расшаренной папки
*/
func (uc *Usecase) Shared(ctx context.Context, options fileDomain.FileOptionsV2) ([]fileDomain.File, error) {
	_, err := handleDirSetUser(ctx, &options)
	if err != nil {
		return []fileDomain.File{}, err
	}

	var files []fileDomain.File
	options.IgnoreCloudEmail = true
	if options.Dir == "/" {
		sharedDirs, err := uc.repo.GetSharedDirs(ctx, "", options.UserID, true)
		foundShared := !errors.Is(err, file.ErrNotFound)
		if err != nil && foundShared {
			log.Println("GetSharedDirs error:", err)
			return []fileDomain.File{}, err
		}
		if foundShared {
			for _, sharedDir := range sharedDirs {
				sharedDirFromFiles, err := uc.repo.GetFileByID(ctx, sharedDir.ID)
				if err != nil {
					log.Println("GetFiles error:", err)
					return []fileDomain.File{}, err
				}
				if options.DirsRequired {
					files = append(files, sharedDirFromFiles)
				}
				options.UserID = ""
				tmpOptionsDir := options.Dir
				options.Dir = sharedDir.Path
				filesTmp, err := uc.repo.GetFilesV2(ctx, options)
				options.Dir = tmpOptionsDir

				if err != nil && !errors.Is(err, file.ErrNotFound) {
					log.Println("GetFiles error:", err)
					return []fileDomain.File{}, err
				}

				files = append(files, filesTmp...)
			}
		}
	} else {
		rootDir := strings.Split(options.Dir, "/")[1]
		_, err = uc.repo.GetSharedDirs(ctx, "/"+rootDir, options.UserID, true)
		if err != nil {
			log.Println("GetSharedDir error:", err)
			return []fileDomain.File{}, err
		}
		options.UserID = ""
		files, err = uc.repo.GetFilesV2(ctx, options)
		if err != nil && !errors.Is(err, file.ErrNotFound) {
			log.Println("GetSharedDir error:", err)
			return []fileDomain.File{}, err
		}
	}
	if options.FirstNesting {
		return filterFilesByNesting(files, options.Dir), nil
	}
	return files, nil
}

// files + dirs + firstNesting
/*
	запрос на файлы и папки пользователя, где есть cloudEmail
	если нет cloudEmail, то перебор всех
*/
func (uc *Usecase) Drive(ctx context.Context, options fileDomain.FileOptionsV2) ([]fileDomain.File, error) {
	user, err := handleDirSetUser(ctx, &options)
	if err != nil {
		return []fileDomain.File{}, err
	}
	var files []fileDomain.File

	if options.CloudEmail != "" {
		files, err = uc.repo.GetFilesV2(ctx, options)
		if err != nil && !errors.Is(err, file.ErrNotFound) {
			return []fileDomain.File{}, err
		}
	} else {
		for _, cloud := range user.ConnectedClouds {
			log.Println("options.CloudEmail 2 = ", cloud.CloudEmail)
			options.CloudEmail = cloud.CloudEmail
			resultsTmp, err := uc.repo.GetFilesV2(ctx, options)
			if err != nil {
				log.Println("GetFiles: err:", err)
				return []fileDomain.File{}, err
			}
			files = append(files, resultsTmp...)
		}
	}
	if options.FirstNesting {
		return filterFilesByNesting(files, options.Dir), nil
	}
	return files, nil
}

// files + dirs + firstNesting
/*
	запрос на файлы и папки пользователя (HasCloudEmail = false)
*/
func (uc *Usecase) Internal(ctx context.Context, options fileDomain.FileOptionsV2) ([]fileDomain.File, error) {
	_, err := handleDirSetUser(ctx, &options)
	if err != nil {
		return []fileDomain.File{}, err
	}

	files, err := uc.repo.GetFilesV2(ctx, options)
	if err != nil && !errors.Is(err, file.ErrNotFound) {
		log.Println("GetFiles: err:", err)
		return []fileDomain.File{}, err
	}
	if options.FirstNesting {
		return filterFilesByNesting(files, options.Dir), nil
	}
	return files, nil
}

/*
smart = false
  - вызвать Shared 		(DirsRequired = false, 	FilesRequired = true, status = "")
  - вызвать Drive 		(DirsRequired = false, 	FilesRequired = true, status = "")
  - вызвать Internal 	(DirsRequired = false, 	FilesRequired = true, status = "")

smart = true
  - вызвать метод SmartSearch
*/

func (uc *Usecase) SearchV2(ctx context.Context, options fileDomain.FileOptionsV2) ([]fileDomain.File, error) {
	_, err := handleDirSetUser(ctx, &options)
	if err != nil {
		return []fileDomain.File{}, err
	}
	if options.Smart {
		return uc.repo.SmartSearchV2(ctx, options)
	}

	var files []fileDomain.File
	files, err = uc.SharedDriveInternal(ctx, options)
	if err != nil && !errors.Is(err, file.ErrNotFound) {
		return []fileDomain.File{}, err
	}

	var filteredFiles []fileDomain.File

	for _, file := range files {
		if strings.Contains(file.Filename, options.Query) {
			filteredFiles = append(filteredFiles, file)
		}
	}

	return filteredFiles, nil
}

// only files
/*
	- вызвать Shared 			(DirsRequired = true, 	FilesRequired = false)
	- вызвать Drive 			(DirsRequired = true, 	FilesRequired = false)
	- вызвать Internal 			(DirsRequired = true, 	FilesRequired = false)
*/

func (uc *Usecase) Dirs(ctx context.Context, options fileDomain.FileOptionsV2) ([]fileDomain.File, error) {
	_, err := handleDirSetUser(ctx, &options)
	if err != nil {
		return []fileDomain.File{}, err
	}
	var files []fileDomain.File

	files, err = uc.SharedDriveInternal(ctx, options)
	if err != nil && !errors.Is(err, file.ErrNotFound) {
		return []fileDomain.File{}, err
	}

	var filteredFiles []fileDomain.File
	options.IgnoreCloudEmail = true
	for _, file := range files {
		if strings.Contains(file.Filename, options.Query) {
			filteredFiles = append(filteredFiles, file)
		}
	}

	return filteredFiles, nil
}

func (uc *Usecase) SharedDriveInternal(ctx context.Context, options fileDomain.FileOptionsV2) ([]fileDomain.File, error) {
	var files []fileDomain.File

	// shared
	filesTmp, err := uc.Shared(ctx, options)
	if err != nil && !errors.Is(err, file.ErrNotFound) {
		return []fileDomain.File{}, err
	}
	files = append(files, filesTmp...)
	// printPaths(filesTmp, "Shared files")

	// drive
	filesTmp, err = uc.Drive(ctx, options)
	if err != nil && !errors.Is(err, file.ErrNotFound) {
		return []fileDomain.File{}, err
	}
	files = append(files, filesTmp...)
	// printPaths(filesTmp, "Drive files")

	// internal
	filesTmp, err = uc.Internal(ctx, options)
	if err != nil && !errors.Is(err, file.ErrNotFound) {
		return []fileDomain.File{}, err
	}
	files = append(files, filesTmp...)
	// printPaths(filesTmp, "Internal files")

	return files, err
}
