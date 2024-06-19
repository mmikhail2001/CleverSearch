import React, { FC } from 'react';
import './textWithImg.scss';
import { Typography } from '@mui/material';
import { isNullOrUndefined } from '@helpers/isNullOrUndefined';

interface TextWithImgProps {
	text: string;
	subText?: string;
	imgSrc: string | React.ReactNode;
	altImgText: string;
	className: string;
	onClick?: (e: React.MouseEvent<HTMLParagraphElement>) => void;
	leftIconProp?: React.ReactNode,
	rightIconProp?: React.ReactNode,
	fontSize?: string,
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
	fontSize,
}) => {
	if (isNullOrUndefined(fontSize)) fontSize = 'var(--ft-paragraph)'

	return (
		<div className={[className, 'text-with-img'].join(' ')}  onClick={onClick}>
			{leftIconProp}
			{typeof imgSrc === 'string'
			? <img className="text-image" src={imgSrc} alt={altImgText}/>
			: imgSrc
			}
			<div className="text-option">
				<Typography fontSize={fontSize}>{text}</Typography>
				{subText ? <Typography sx={{
					textOverflow: 'ellipsis',
					maxWidth: '100%',
					overflow: 'hidden'
				}}
					fontSize={'var(--ft-body)'}>{subText}</Typography> : null}
			</div>
			{rightIconProp}
		</div >
	);
};
