import { fileFile } from "@models/searchParams";
import { SerializedError, UnknownAction } from "@reduxjs/toolkit";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { changeDir } from "@store/currentDirectoryAndDisk";
import { FileShow } from "@ui/fileShow/fileShow";
import React, { Dispatch, FC } from "react";
import folderIconPath from '@icons/files/Folder.svg'
import documentIconPath from '@icons/files/Book.svg'
import imageIconPath from '@icons/files/image.svg'

export interface RenderFieldsProps {
    data: fileFile[],
    error: FetchBaseQueryError | SerializedError,
    isError: boolean,
    isLoading: boolean,
    dispatch: Dispatch<UnknownAction>,
    dirs: string[],
    deleteFile: (fileName: string) => void
}


export const RenderFields: FC<RenderFieldsProps> = ({
    data,
    error,
    isError,
    isLoading,
    dispatch,
    dirs,
    deleteFile,
}) => {
    if (isLoading) {
        return <h1>Подождите, загружаем файлы...</h1>;
    }
    
    if (isError) {
        return <h1>Произошла ошибка ${JSON.stringify(error)}</h1>;
    }

    if (!data || data.length === 0) {
       return <div>Ничего нет</div> 
    }

    return (
        <div>
        {data.map((file) => {
            console.log("file", file)
            let iconSrc = "";
            if (file.is_dir) {
                iconSrc = folderIconPath
            } else {
                let splits = file["content_type"]?.split('/')
                console.log(splits)
                if (splits?.length > 0) {
                    switch(splits[1]) {
                        case 'pdf':
                            iconSrc = documentIconPath;
                            break;
                        default:
                            iconSrc = imageIconPath;
                    }
                }
            }

            return(
            <FileShow
            keyForComp={file.id}
            iconSrc={iconSrc}
            altText={file.is_dir ? "folder" : "file"}
            filename={file.is_dir ? file.path.split('/').pop() : file.filename}
            date={file.date}
            size={file.size}
            onClick={file.is_dir
                ? () => dispatch(
                    changeDir({
                        dirs: file.path.split('/'),
                        current: file.path,
                    })
                )
                : () => { } }
            onDelete={() => deleteFile(file.path)}
        ></FileShow>
            )})}
        </div>
    );
};

