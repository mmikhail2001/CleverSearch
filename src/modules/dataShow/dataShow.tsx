import { fileFile } from "@models/searchParams";
import { FC, useEffect } from "react";
import "./dataShow.scss";

import { useSearchMutation, useShowMutation } from "@api/searchApi";
import { Dispatch, SerializedError, UnknownAction } from "@reduxjs/toolkit";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { changeDir } from "@store/currentDirectoryAndDisk";
import { useAppSelector } from "@store/store";
import { FileShow } from "@ui/fileShow/fileShow";
import { useDispatch } from "react-redux";
import { useDeleteFileMutation } from "@api/filesApi";
interface DataShowProps {}

const showData = (
  data: fileFile[],
  error: FetchBaseQueryError | SerializedError,
  isError: boolean,
  isLoading: boolean,
  dispatch: Dispatch<UnknownAction>,
  dirs: string[],
  deleteFile: (fileName: string) => void
) => {
  if (isLoading) {
    return <h1>Подождите, загружаем файлы...</h1>;
  }

  if (isError) {
    return <h1>Произошла ошибка ${JSON.stringify(error)}</h1>;
  }

  return (
    <div>
      {data?.map((file) => {
        return (
          <FileShow
            iconSrc={"TODO"}
            altText={file.is_dir ? "folder" : "file"}
            filename={file.is_dir ? file.path.split('/').pop() : file.filename}
            date={file.date}
            size={file.size}
            onClick={
              file.is_dir
                ? () =>
                    dispatch(
                      changeDir({
                        dirs: file.path.split('/'),
                        current: file.path,
                      })
                    )
                : () => {}
            }
            onDelete={() => deleteFile(file.path)}
          ></FileShow>
        );
      })}
    </div>
  );
};

const showSearch = (
  data: fileFile[],
  error: FetchBaseQueryError | SerializedError,
  isError: boolean,
  isLoading: boolean,
  dispatch: Dispatch<UnknownAction>,
  dirs: string[],
  deleteFile: (fileName: string) => void
) => {
  if (isLoading) {
    return <h1>Подождите, загружаем файлы...</h1>;
  }

  if (isError) {
    return <h1>Произошла ошибка ${JSON.stringify(error)}</h1>;
  }

  return (
    <div>
      {data?.map((file) => {
        return (
          <FileShow
            iconSrc={"TODO"}
            altText={"TODO"}
            filename={file.filename}
            date={file.date}
            size={file.size}
            onClick={
              file.is_dir
                ? () =>
                    dispatch(
                      changeDir({
                        dirs: [file.filename],
                        current: "",
                      })
                    )
                : () => {}
            }
            onDelete={() => deleteFile(file.path)}
          ></FileShow>
        );
      })}
    </div>
  );
};

export const DataShow: FC<DataShowProps> = ({}) => {
  const [show, showResp] = useShowMutation();
  const { currentDisk, currentDir, dirs } = useAppSelector(
    (state) => state.currentDirDisk
  );
  useEffect(() => {
    if (isShow) {
      show({ limit: 10, offset: 0, disk: currentDisk, dir: dirs });
    }
    return;
  }, [currentDisk, dirs]);
  const { isSearch, isShow } = useAppSelector((state) => state.whatToShow);

  const [search, {data, ...searchResp}] = useSearchMutation({fixedCacheKey: "search"});
  const params = useAppSelector((state) => state.searchRequest);

  useEffect(() => {
    if (isSearch) {
      console.log('searchb')
    }
    return;
  }, [params.dir, params.disk, params.fileType, params.limit, params.offset, params.query, params.smartSearch, isSearch]);

  const [deleteFile, _] = useDeleteFileMutation();
  const dispatch = useDispatch();
  return (
    <div className="data-show">
      <div className="data-show__header">
        {isShow ? dirs.map((dir) => <p>{dir}</p>) : ""}
        {isSearch ? "Результаты поиска:" : ""}
        <div
          style={{ color: "var(--main-color-500)" }}
          onClick={() =>
            dispatch(
              changeDir({
                dirs: dirs.slice(0, -1) || [],
                current: dirs[-2] || "",
              })
            )
          }
        >
          Назад
        </div>
      </div>
      {isShow
        ? showData(
            showResp.data?.body,
            showResp.error,
            showResp.isError,
            showResp.isLoading,
            dispatch,
            dirs,
            // TODO make with tags
            (fileName) => {deleteFile([fileName]); search(params);}
          )
        : ""}
      {isSearch
        ? showSearch(
            data?.body,
            searchResp.error,
            searchResp.isError,
            searchResp.isLoading,
            dispatch,
            [""],
            (fileName) => {console.log(params);deleteFile([fileName]); search(params);}
          )
        : ""}
    </div>
  );
};
