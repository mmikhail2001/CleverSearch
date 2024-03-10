import { DiskType, diskImgSrc } from "@models/disk";
import { switchToShow } from "@store/whatToShow";
import { Button, Variants } from "@ui/button/Button";
import { TextWithImg } from "@ui/textWithImg/textWithimg";
import React, { FC, useState } from "react";
import { useDispatch } from "react-redux";
import "./sidebar.scss";
import { ButtonWithInput } from "@ui/buttonWithInput/buttonWithInput";
import { useCreateDirMutation, useDeleteFileMutation, usePushFileMutation } from "@api/filesApi";
import { useAppSelector } from "@store/store";
import { changeDir, changeDisk } from "@store/currentDirectoryAndDisk";
import { diskTypes, isDiskType } from "@models/searchParams";
import { useSearchMutation, useShowMutation } from "@api/searchApi";

interface SidebarProps {}

let getTextWithImg = (
  selected: boolean,
  disk: DiskType,
  text: string,
  setState: (text: diskTypes) => void
) => {
  const { src, altText } = disk;

  return (
    <TextWithImg
      key={text + src}
      className={selected ? "selected" : ""}
      text={text}
      imgSrc={src}
      altImgText={altText}
      onClick={() => {
        if (isDiskType(text)) {
          setState(text as diskTypes);
        }
      }}
    />
  );
};

export const Sidebar: FC<SidebarProps> = ({}) => {
  const [selectedField, setSelectedField] = useState(
    Array.from(diskImgSrc.keys())[0]
  );

  const { isSearch, isShow } = useAppSelector((state) => state.whatToShow);
  const { dirs, currentDisk } = useAppSelector((state) => state.currentDirDisk);
  const dispatch = useDispatch();
  const [search] = useSearchMutation({fixedCacheKey: "search"})
  const [show] = useShowMutation({fixedCacheKey: "show"})

  const allDisks = Array.from(diskImgSrc.keys()).map((key) =>
    getTextWithImg(
      selectedField === key && !isSearch,
      diskImgSrc.get(key)!,
      key,
      (text) => {
        setSelectedField(text);
        if (!isShow) {
          dispatch(switchToShow());
        }
        dispatch(changeDisk(text));
        dispatch(changeDir({ dirs: [], current: "" }));
      }
    )
  );
  const params = useAppSelector((state) => state.searchRequest);

  const [createDir, respCreateDir] = useCreateDirMutation();

  const [send, resp] = usePushFileMutation();
  return (
    <div className="sidebar">
      <div className="our-name-place">
        <TextWithImg
          onClick={() => dispatch(switchToShow())}
          text="CleverSearch"
          className="our-name"
          imgSrc="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fupload.wikimedia.org%2Fwikipedia%2Fcommons%2Fd%2Fda%2FPurple_flower_(4764445139).jpg&f=1&nofb=1&ipt=447efee6d4bff25104c5e9593c10c1fc7e7f14813132bf35904df30ca20c035a&ipo=images"
          altImgText="our-logo"
        />
      </div>
      <ButtonWithInput
        buttonText="Добавить"
        onChange={(files: FileList) => {
          Array.from(files).forEach((file) => {
            const formData = new FormData();

            formData.append("file", file, file.name);
            formData.append('dir', dirs.join(''))
            send(formData);
            setTimeout(() => {
              if (isSearch) {
                search(params)
              } else {
                show({ limit: 10, offset: 0, disk: currentDisk, dir: dirs })
              }
            }, 100);
          });
        }}
        disabled={false}
        variant={Variants.filled}
      ></ButtonWithInput>
      <Button 
        buttonText="Добавить папку" 
        variant={Variants.filled} 
        clickHandler={() => {
          createDir(dirs.concat("Папка"));
          setTimeout(() => {
            if (isSearch) {
              search(params)
            } else {
              show({ limit: 10, offset: 0, disk: currentDisk, dir: dirs })
            }
          }, 100);
        }}
      />
      <div className="disk-show">
        <h2 className="disk-show-label">Ваши диски</h2>
        <div className="disks">{allDisks}</div>
      </div>
      <div className="under-disks">
        <TextWithImg
          text="Загружаются"
          className="downloading"
          imgSrc="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fupload.wikimedia.org%2Fwikipedia%2Fcommons%2Fd%2Fda%2FPurple_flower_(4764445139).jpg&f=1&nofb=1&ipt=447efee6d4bff25104c5e9593c10c1fc7e7f14813132bf35904df30ca20c035a&ipo=images"
          altImgText="Загрузка"
        />
        {/*TODO  изменить на другой элемент*/}
        <div
          className={["text-with-img", "work-in-progress"].join(" ")}
          onClick={() => console.log("TODO")}
        >
          <img
            className="text-image"
            src={
              "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fupload.wikimedia.org%2Fwikipedia%2Fcommons%2Fd%2Fda%2FPurple_flower_(4764445139).jpg&f=1&nofb=1&ipt=447efee6d4bff25104c5e9593c10c1fc7e7f14813132bf35904df30ca20c035a&ipo=images"
            }
            alt={"Робот"}
          ></img>
          <div className="container-text">
            <p className="text big-text">{"Обрабатываются"}</p>
            <p className="text small-text">{"для умного поиска"}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
