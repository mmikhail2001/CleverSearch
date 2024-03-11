import { fileFile } from "@models/searchParams";
import { SerializedError, UnknownAction } from "@reduxjs/toolkit";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { changeDir } from "@store/currentDirectoryAndDisk";
import { FileShow } from "@ui/fileShow/fileShow";
import React, { Dispatch, FC } from "react";


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
            return(
            <FileShow
            keyForComp={file.id}
            iconSrc={"TODO"}
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

