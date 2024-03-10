import React, { FC } from "react";
import "./fileShow.scss";

interface FileShowProps {
  iconSrc: string;
  altText?: string;
  filename: string;
  date: string; // TODO think about change to date type
  size: string;
  onClick?: () => void;
  onDelete: () => void;
}

export const FileShow: FC<FileShowProps> = ({
  iconSrc,
  altText,
  filename,
  date,
  size,
  onClick,
  onDelete,
}) => {
  return (
    <div className="file-show-line">
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
