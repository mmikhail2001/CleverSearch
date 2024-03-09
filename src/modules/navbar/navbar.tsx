import React, { FC, useState } from "react";
import { DiskType, diskImgSrc } from "@models/disk";
import { TextWithImg } from "@ui/textWithImg/textWithimg";
import "./navbar.scss";

interface NavbarProps {}

let getTextWithImg = (
  selected: boolean,
  disk: DiskType,
  text: string,
  setState: React.Dispatch<string>
) => {
  const { src, altText } = disk;

  return (
    <TextWithImg
      key={text + src}
      className={selected ? "selected" : ""}
      text={text}
      imgSrc={src}
      altImgText={altText}
      onClick={() => setState(text)}
    />
  );
};

export const Navbar: FC<NavbarProps> = ({}) => {
  const [selectedField, setSelectedField] = useState(
    Array.from(diskImgSrc.keys())[0]
  );
  const allDisks = Array.from(diskImgSrc.keys()).map((key) =>
    getTextWithImg(
      selectedField === key,
      diskImgSrc.get(key)!,
      key,
      setSelectedField
    )
  );
  return (
    <div className="navbar">
      <div className="search-bar-place"></div>
      <div className="user-profile-place"></div>
    </div>
  );
};
