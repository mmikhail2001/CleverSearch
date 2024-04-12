import React, { FC, useEffect, useRef, useState } from 'react';
import './viewImg.scss'

export interface ViewImgProps {
	imgSrc: string,
	altText?: string,
	authToken?: string,
}

export const ViewImg: FC<ViewImgProps> = React.memo(function viewImg({ imgSrc, altText, authToken }: ViewImgProps) {
	const [image, setImage] = useState<string>(null)
	const [loading, setLoading] = useState<boolean>(false)
	const ref = useRef<HTMLImageElement>(null)

	useEffect(()=> {
		setLoading(true)
		fetch(imgSrc, {	
		headers: {'Authorization': `Bearer ${authToken}` }
	  }).then((result) => {
		result.blob().then(res => {
			setImage(URL.createObjectURL(res))
			setLoading(false)
		})
	  })
	}, [])

	// Release memory from object
	useEffect(() =>{
		if (ref.current)
			ref.current.onload =() => URL.revokeObjectURL(image)
	}, [ref])
		
	return <div className='view-img-container'>
		{loading? "loading" : <img className='view-img' src={image} alt={altText} />}
	</div >
});

