import React, { FC } from "react";
import { MultiValue, SingleValue } from "react-select";
import { diskImgSrc } from "../../../../models/disk";
import { diskTypes, fileTypes } from "../../../../models/searchParams";
import {
  Option,
  SelectorWithImg,
} from "../../../../ui/selectorOptionWIthImg/selectorOptionWithImg";

let getDisksToOptions = () => {
  let keys = Array.from(diskImgSrc.keys());
  let result: Option[] = Array.from(
    keys.map((key) => {
      return { label: key, value: key, imgSrc: diskImgSrc.get(key)?.src || "" };
    })
  );

  if (result && result.length !== 0) {
    return result;
  }
  return [{ label: "", value: "", imgSrc: "" }];
};

function getDiskKey(diskStr: string): keyof typeof diskTypes | null {
  const keys = Object.values(diskTypes) as Array<keyof typeof diskTypes>;
  for (const key of keys) {
    if (diskTypes[key] === diskStr) {
      return key;
    }
  }

  return null;
}

let diskVal = (
  newVal: MultiValue<Option> | SingleValue<Option>
): diskTypes[] => {
  if (newVal && "length" in newVal) {
    let diskValuesInString = newVal
      .map((val) => getDiskKey(val.value))
      .filter((val) => val !== null) as unknown as keyof diskTypes[];

    let newDiskValuesInString;
    if (!Array.isArray(diskValuesInString)) {
      newDiskValuesInString = [diskValuesInString];
    } else {
      newDiskValuesInString = diskValuesInString;
    }

    // HACK ts ignore remove
    // @ts-ignore
    return [newDiskValuesInString].map((type) => diskTypes[type]);
  }
  if (newVal) {
    let diskType = getDiskKey(newVal.value);
    if (diskType) {
      return [diskTypes[diskType]];
    }
  }

  return [diskTypes.all];
};

export interface SearchDiskLineProps {
  changeState: React.Dispatch<
    React.SetStateAction<{
      smartSearch: boolean;
      fileType: fileTypes[];
      query: string;
      dir: string;
      disk: diskTypes[];
    }>
  >;
  state: {
    smartSearch: boolean;
    fileType: fileTypes[];
    query: string;
    dir: string;
    disk: diskTypes[];
  };
}

export const SearchDiskLine: FC<SearchDiskLineProps> = ({
  changeState,
  state,
}) => {
  return (
    <div className="line">
      <p className="search-box__text">Диск</p>
      <SelectorWithImg
        options={getDisksToOptions()}
        isMulti={true}
        onChange={(newVal) => changeState({ ...state, disk: diskVal(newVal) })}
      />
    </div>
  );
};
