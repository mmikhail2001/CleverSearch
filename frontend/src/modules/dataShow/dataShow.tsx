import { FC } from "react";
import "./dataShow.scss";

import { useDeleteFileMutation } from "@api/filesApi";
import { useSearchMutation, useShowMutation } from "@api/searchApi";
import { changeDir } from "@store/currentDirectoryAndDisk";
import { useAppSelector } from "@store/store";
import { useDispatch } from "react-redux";
import { RenderFields } from "@ui/renderFields/renderFields";
interface DataShowProps {}

export const DataShow: FC<DataShowProps> = ({}) => {
  const [show, showResp] = useShowMutation({fixedCacheKey: "show"});
  const { currentDisk, currentDir, dirs } = useAppSelector(
    (state) => state.currentDirDisk
  );

  const { isSearch, isShow } = useAppSelector((state) => state.whatToShow);

  const [search, {data, ...searchResp}] = useSearchMutation({fixedCacheKey: "search"});

  const [deleteFile] = useDeleteFileMutation();
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
        ? <RenderFields 
        data = {showResp.data?.body}
        error = {showResp.error}
        isError = {showResp.isError}
        isLoading = {showResp.isLoading}
        dispatch = {dispatch}
        dirs = {dirs}
        deleteFile = { 
          (fileName:string): void => {
            deleteFile([fileName]);
            setTimeout(() => 
             show(
              { limit: 10, offset: 0, disk: currentDisk, dir: dirs }),
            100);
          }}
        />
        : ""}
      {isSearch
        ? <RenderFields 
        data = {data?.body}
        error = {searchResp.error}
        isError = {searchResp.isError}
        isLoading = {searchResp.isLoading}
        dispatch = {dispatch}
        dirs = {dirs}
        deleteFile = { 
          (fileName:string): void => {
            deleteFile([fileName]);
            setTimeout(() => 
             show(
              { limit: 10, offset: 0, disk: currentDisk, dir: dirs }),
            100);
          }}
        />
        : ""}
    </div>
  );
};
