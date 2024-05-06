import React, { FC, useEffect, useRef, useState } from 'react';
import './viewImg.scss'

import AddRoundedIcon from '@mui/icons-material/AddRounded';
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded';

import {
	TransformWrapper,
	TransformComponent,
	useControls,
} from "react-zoom-pan-pinch";
import { IconButton } from '@mui/material';
import { Height } from '@mui/icons-material';


export interface ViewImgProps {
	imgSrc: string,
	altText?: string,
}

const controls = (zoomOut: () => void, zoomIn: ()=>void) => {
	return (
		<div className="modal-scale">
			<IconButton 
				onClick={() => zoomOut()}
				sx={{color:'inherit'}}
			>
				<AddRoundedIcon sx={{color:'inherit'}} />
			</IconButton>
			<IconButton 
				onClick={() => zoomIn()}
				sx={{color:'inherit'}}
			>
				<RemoveRoundedIcon sx={{color:'inherit !'}} />
			</IconButton>
		</div>
	)
}

export const ViewImg: FC<ViewImgProps> = React.memo(function viewImg({ imgSrc, altText }: ViewImgProps) {
	const [zoomLevel, setZoomLevel] = useState(1);
	const [ready, setReady] = useState(false)

	const [widthCont, setWidthCont] = useState('100%')
	const [heightCont, setheightCont] = useState('100%')

	const img = new Image();

	const readyState = (widthRatio:number, heightRatio: number) => {
		console.log("IF RATIO",widthRatio, heightRatio)
		const initialZoom = Math.max(widthRatio, heightRatio);
	
		setZoomLevel(initialZoom);
		setReady(true)
	}

	useEffect(() => {
		img.onload = () => {
			const imgWidth = img.naturalWidth;
			const imgHeight = img.naturalHeight;

			// 114px width
			// 104px height
			const screenResHeight = window.innerHeight
			const screenResWidth = window.innerWidth

			const maxContainerHeight = screenResHeight - 104;
			const maxContainerWidth = screenResWidth - 114;

			let widthRatio: number;
			let heightRatio: number;

			if (maxContainerWidth >= imgWidth && maxContainerHeight >= imgHeight) {
				// Image can be inside container
				setWidthCont(`${imgWidth}px`)
				setheightCont(`${imgHeight}px`)
				
				readyState(1, 1)
				
				console.log("IF",maxContainerWidth, maxContainerHeight, imgWidth, imgHeight)

				return
			}

			
			widthRatio = maxContainerWidth / imgWidth;
			heightRatio = maxContainerHeight / imgHeight;
			
			setheightCont(`${maxContainerHeight}px`)
			setWidthCont(`${maxContainerWidth}px`)
			
			readyState(widthRatio, heightRatio)
			console.log("NOT IF",maxContainerWidth, maxContainerHeight, imgWidth, imgHeight)
		};
		img.src = imgSrc;
  	}, [imgSrc]);

	return (
		<div 
			className='view-img-container' 
			style={{height: heightCont, width: widthCont}} 
		>
			{ready ? 
				<TransformWrapper
					limitToBounds={true}
					centerOnInit={true}
					minScale={0.4}
					initialScale={zoomLevel}
					disablePadding={true}
				>
				{({ zoomIn, zoomOut, resetTransform, ...rest }) => (
					<React.Fragment>
						{/* {controls(() => zoomOut(), () => zoomIn())} */}
						<TransformComponent
						>
							<img src={imgSrc} width={'100%'} height={'100%'} alt={altText} />
						</TransformComponent>
					</React.Fragment>
				)}
				</TransformWrapper>
			: "Loading..."	
			}
	</div>
	)
});

