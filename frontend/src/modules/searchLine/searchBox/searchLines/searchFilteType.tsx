import React, { FC } from "react";
import { MultiValue, SingleValue } from "react-select";
import { diskTypes, fileTypes } from "../../../../models/searchParams";
import {
  Option as MultiOption,
  SelectorMulti,
} from "../../../../ui/selectorMulti/selectorMulti";

let getFilesTypesToOptions = (): MultiOption[] => {
  return [
    {
      label: "Изображение",
      value: "img",
    },
    {
      label: "Текст",
      value: "text",
    },
    {
      label: "Видео",
      value: "video",
    },
    {
      label: "Аудио",
      value: "audio",
    },
  ];
};

// TODO think about connecting with searchDisk enum
function getFileKey(fileStr: string): keyof typeof fileTypes | null {
  const keys = Object.values(fileTypes) as Array<keyof typeof fileTypes>;
  for (const key of keys) {
    if (fileTypes[key] === fileStr) {
      return key;
    }
  }

  return null;
}

let fileValues = (
  newVal: MultiValue<MultiOption> | SingleValue<MultiOption>
): fileTypes[] => {
  if ("length" in newVal) {
    let diskValuesInString = newVal
      .map((val) => getFileKey(val.value))
      .filter((val) => val !== null) as unknown as keyof fileTypes[];

    let newDiskValuesInString;
    if (!Array.isArray(diskValuesInString)) {
      newDiskValuesInString = [diskValuesInString];
    } else {
      newDiskValuesInString = diskValuesInString;
    }

    // HACK ts ignore remove
    // @ts-ignore
    return [newDiskValuesInString].map((type) => fileTypes[type]);
  }
  if (newVal) {
    let diskType = getFileKey(newVal.value);
    if (diskType) {
      return [fileTypes[diskType]];
    }
  }

  return [fileTypes.all];
};
export interface SearchFileTypeLineProps {
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

export const SearchFileType: FC<SearchFileTypeLineProps> = ({
  changeState,
  state,
}) => {
  return (
    <div className="line">
      <p className="search-box__text">Тип файла</p>
      <SelectorMulti
        options={getFilesTypesToOptions()}
        isMulti={true}
        onChange={(newVal) =>
          changeState({ ...state, fileType: fileValues(newVal) })
        }
      />
    </div>
  );
};
