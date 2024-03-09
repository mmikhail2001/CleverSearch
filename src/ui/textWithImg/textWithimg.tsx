import React, { FC } from "react";
import "./textWithImg.css";

interface TextWithImgProps {
  text: string;
  imgSrc: string;
  altImgText: string;
  className: string;
  onClick?: (e: React.MouseEvent<HTMLParagraphElement>) => void;
}

export const TextWithImg: FC<TextWithImgProps> = ({
  text,
  imgSrc,
  className,
  onClick,
  altImgText,
}) => {
  return (
    <div className={["text-with-img", className].join(" ")} onClick={onClick}>
      <img className="text-image" src={imgSrc} alt={altImgText}></img>
      <p className="text">{text}</p>
    </div>
  );
};
