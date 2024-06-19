import { TextWithImg } from '@feature/textWithImg/textWithimg';
import { isNullOrUndefined } from '@helpers/isNullOrUndefined';
import React, { FC } from 'react'

interface GetTextWithImgProps {
	selected: boolean,
    name:string,
    image: string,
    altText?: string,
	onClick: (text: string) => void,
    className?:string,
}

export const GetTextWithImg: FC<GetTextWithImgProps> = ({
	selected,
	name,
    image,
    altText,
	onClick,
    className,
}) => {
	if (isNullOrUndefined(name)) return null

	return (
		<div className='settings__disk'>
			<TextWithImg
				key={name + image}
				className={[className, 'text-with-img-row'].join(' ')}
				text={name}
				imgSrc={image}
				altImgText={altText}
				onClick={() => onClick(name)}
			/>
		</div>
	);
};