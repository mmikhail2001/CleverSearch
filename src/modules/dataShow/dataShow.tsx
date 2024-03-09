import { FC, useEffect } from "react";
import { useSearchMutation, useShowMutation } from "../../api/searchApi";
import "./dataShow.css";

import { skipToken } from "@reduxjs/toolkit/query";
import { useAppSelector } from "../../store/store";
import { FileShow } from "../../ui/fileShow/fileShow";
interface DataShowProps {}

export const DataShow: FC<DataShowProps> = ({}) => {
  const [show, resp] = useShowMutation();
  useEffect(() => {
    show({ limit: 10, offset: 0 });
    return;
  }, []);

  const [search, response] = useSearchMutation({} ?? skipToken);
  const params = useAppSelector((state) => state.searchRequest);
  useEffect(() => {
    search(params);
    return;
  }, [params]);
  const { isSearch, isShow } = useAppSelector((state) => state.whatToShow);
  console.log("respa response", response);
  return (
    <div className="data-show">
      {isShow ? (
        <div className="Show">
          {resp.isLoading ? "Loading..." : ""}
          {resp.isError ? `Error ${resp.error}` : ""}
          {resp.isSuccess
            ? resp.data.files.map((file) => {
                return (
                  <FileShow
                    iconSrc={"TODO"}
                    altText={"TODO"}
                    filename={file.filename}
                    date={file.date}
                    size={file.size}
                  />
                );
              })
            : ""}
        </div>
      ) : (
        ""
      )}
      {isSearch
        ? response.data?.files.map((file) => {
            return (
              <FileShow
                iconSrc={"TODO"}
                altText={"TODO"}
                filename={file.filename}
                date={file.date}
                size={file.size}
              />
            );
          })
        : ""}
      <div>{response.isLoading ? "Search loading" : ""}</div>
      <div>{response.isError && isSearch ? "Error at search request" : ""}</div>
    </div>
  );
};
