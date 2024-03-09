import { skipToken } from "@reduxjs/toolkit/query";
import { FC, useState } from "react";
import { useSearchMutation } from "../../api/searchApi";
import { diskTypes, fileTypes } from "../../models/searchParams";
import { Input, InputVariants } from "../../ui/input/input";
import "./searchLine.css";

import { useDispatch } from "react-redux";
import { newValues } from "../../store/searchRequest";
import { switchToSearch } from "../../store/whatToShow";
import { SearchBox } from "./searchBox/searchBox";
interface SearchLineProps {}

export const SearchLine: FC<SearchLineProps> = ({}) => {
  const [isBoxOpen, setisBoxOpen] = useState(false);
  const [searchValue, setsearchValue] = useState({
    smartSearch: false,
    fileType: [fileTypes.all],
    query: "",
    dir: "",
    disk: [diskTypes.our],
  });

  //   TODO make search api
  const [search, response] = useSearchMutation({} ?? skipToken);
  const dispatch = useDispatch();

  return (
    <div className="search-line">
      <div className="icon-with-text">
        <div className="search-icon-container">
          <img alt="search icon" className="search-icon" src=""></img>
        </div>
        <div className="search-text">
          <Input
            onKeyDown={(e) => {
              if (e.key.toLowerCase() === "enter") {
                search(searchValue);
                dispatch(newValues(searchValue));
                dispatch(switchToSearch(""));
              }
            }}
            onChange={(e) =>
              setsearchValue({ ...searchValue, query: e.target.value })
            }
            disabled={response.isLoading}
            placeholder={"Найдём любой файл"}
            variant={InputVariants.default}
            type={"search"}
            className={["search-input"]}
            value={searchValue.query}
          />
        </div>
      </div>
      <div
        className="filter-icon-container"
        onClick={() => setisBoxOpen(!isBoxOpen)}
      >
        <img alt="filter icon" className="filter-icon" src=""></img>
      </div>
      {isBoxOpen ? (
        <div className="place-for-search-box">
          <SearchBox
            changeState={setsearchValue}
            state={searchValue}
            closeDrop={() => setisBoxOpen(false)}
            search={() => search(searchValue)}
          ></SearchBox>
        </div>
      ) : (
        ""
      )}
    </div>
  );
};
