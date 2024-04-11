import React, { FC } from 'react';
import './viewImg.scss'

export interface ViewImgProps {
	imgSrc: string,
	altText?: string,
}

export const ViewImg: FC<ViewImgProps> = React.memo(function viewImg({ imgSrc, altText }: ViewImgProps) {
	return <div className='view-img-container'>
		<img className='view-img' src={imgSrc} alt={altText} />
	</div >
});

