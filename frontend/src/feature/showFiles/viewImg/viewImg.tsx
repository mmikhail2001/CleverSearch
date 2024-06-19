import React, { FC, useEffect, useRef, useState } from 'react';
import './viewImg.scss'


import {
	TransformWrapper,
	TransformComponent,
	useControls,
} from "react-zoom-pan-pinch";
import { IconButton, Typography } from '@mui/material';
import { useMobile } from 'src/mobileProvider';

export interface ViewImgProps {
	imgSrc: string,
	altText?: string,
}

export const ViewImg: FC<ViewImgProps> = React.memo(function viewImg({ imgSrc, altText }: ViewImgProps) {
	const {currentWidth, currentHeight} = useMobile()

	const [zoomLevel, setZoomLevel] = useState(1);
	const [ready, setReady] = useState(false)

	const [widthCont, setWidthCont] = useState('100%')
	const [heightCont, setheightCont] = useState('100%')

	const [imageSize, setImageSize] = useState<{width: number, height: number}>({width: 0, height: 0})
	const [isPitchWork, setPitchWork] = useState(false)

	const img = new Image();


	const readyState = (widthRatio:number, heightRatio: number) => {
		const initialZoom = Math.max(widthRatio, heightRatio);
		
		if (initialZoom !== 1) setPitchWork(true)
		setZoomLevel(initialZoom);
		setReady(true)
	}

	const calculateRatios = (
		imageHeight: number, 
		imageWidth: number, 
		screenHeight: number, 
		screenWidth: number
	): {widthRation: number, heightRation: number, screenHeigt: number, screenWidth: number} => {
		if (imageHeight <= screenHeight && imageWidth <= screenWidth) {
			return {
				widthRation: 1, 
				heightRation: 1,
				screenHeigt: imageHeight,
				screenWidth: imageWidth,
			}
		}

		return {
			widthRation: screenWidth / imageWidth,
			heightRation: screenHeight / imageHeight,
			screenHeigt: screenHeight,
			screenWidth: screenWidth,
		}
	}

	useEffect(() => {
		img.onload = () => {
			const correspondence = calculateRatios(img.naturalHeight, img.naturalWidth, currentHeight - 60, currentWidth - 60)

			setheightCont(`${correspondence.screenHeigt}px`)
			setWidthCont(`${correspondence.screenWidth}px`)

			setImageSize({height: img.naturalHeight, width: img.naturalWidth})
			
			readyState(correspondence.heightRation, correspondence.widthRation)
		};
		img.src = imgSrc;
  	}, [imgSrc]);

	useEffect(() => {
		if (ready) {
			const correspondence = calculateRatios(imageSize.height * zoomLevel, imageSize.width * zoomLevel, currentHeight - 60, currentWidth - 60)
			
			setheightCont(`${correspondence.screenHeigt}px`)
			setWidthCont(`${correspondence.screenWidth}px`)
			
			if (Math.max(correspondence.heightRation, correspondence.widthRation) !== 1) {
				setheightCont(`${currentHeight - 60}px`)
				setWidthCont(`${currentWidth - 60}px`)

				setPitchWork(true)
			} else {
				setPitchWork(false)
			}
		}
	}, [zoomLevel,currentHeight,currentWidth])
	
	return (
		<div 
			className='view-img-container' 
			style={{height: heightCont, width: widthCont}} 
		>
			{ready && isPitchWork ? 
				<TransformWrapper
					limitToBounds={true}
					centerOnInit={true}
					minScale={0.4}
					initialScale={zoomLevel}
					onWheel={(ref, event) => {
						setZoomLevel(ref.state.scale)
					}}
					disablePadding={true}
				>
				{({ zoomIn, zoomOut, resetTransform, ...rest }) => (
					<TransformComponent
						wrapperStyle={{width: '100%', height: '100%'}}
					>
						<img src={imgSrc} width={'100%'} height={'100%'} alt={altText} />
					</TransformComponent>
				)}
				</TransformWrapper>
			: null
			}
			{ready ? null : <Typography>Loading ...</Typography>}
			{!isPitchWork && ready ? 
				<img 
					onWheel={(e) => {
						if (e.deltaY > 0) {
							if (zoomLevel <= 0.4) return
							setZoomLevel(zoomLevel - 0.2)
						} else {
							setZoomLevel(zoomLevel + 0.2)
						}
						console.log(e)
					}} 
					src={imgSrc} 
					width={'100%'} 
					height={'100%'} 
					alt={altText} 
				/>
			:null}
	</div>
	)
});

