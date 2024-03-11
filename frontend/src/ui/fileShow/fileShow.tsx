import React, { FC } from "react";
import "./fileShow.scss";

interface FileShowProps {
  keyForComp?: string;
  iconSrc: string;
  altText?: string;
  filename: string;
  date: string; // TODO think about change to date type
  size: string;
  onClick?: () => void;
  onDelete: () => void;
}

export const FileShow: FC<FileShowProps> = ({
  keyForComp,
  iconSrc,
  altText,
  filename,
  date,
  size,
  onClick,
  onDelete,
}) => {
  return (
    <div key={keyForComp} className="file-show-line" >
      <div className="icon-placement">
        <img className="icon" src={iconSrc} alt={altText ? altText : ""}></img>
      </div>
      <div className="filename-with-date" onClick={onClick}>
        <div className="filename">{filename}</div>
        <div className="date">{date}</div>
      </div>
      <div onClick={onDelete}>Delete</div>
      <div className="size">{size}</div>
    </div>
  );
};
