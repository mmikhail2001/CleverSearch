import React, { FC } from 'react';
import './textWithImg.scss';
import { Typography } from '@mui/material';

interface TextWithImgProps {
	text: string;
	subText?: string;
	imgSrc: string;
	altImgText: string;
	className: string;
	onClick?: (e: React.MouseEvent<HTMLParagraphElement>) => void;
	leftIconProp?: React.ReactNode,
	rightIconProp?: React.ReactNode,
}

export const TextWithImg: FC<TextWithImgProps> = ({
	text,
	subText,
	imgSrc,
	className,
	onClick,
	altImgText,
	leftIconProp,
	rightIconProp,
}) => {
	return (
		<div className={['text-with-img', className].join(' ')} onClick={onClick}>
			{leftIconProp}
			<img className="text-image" src={imgSrc} alt={altImgText}></img>
			<div>
				<Typography fontSize={'var(--ft-paragraph)'}>{text}</Typography>
				{subText ? <p className="subText">{subText}</p> : null}
			</div>
			{rightIconProp}
		</div>
	);
};
