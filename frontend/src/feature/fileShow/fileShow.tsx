import React, { FC, useState } from 'react';
import './fileShow.scss';
import { SharedModal } from '@widgets/sharedModal/sharedModal'

interface FileShowProps {
	iconSrc: string;
	altText?: string;
	filename: string;
	date: string;
	size: string;
	onClick?: () => void;
	onDelete: () => void;
	dirPath?: string
}

export const FileShow: FC<FileShowProps> = ({
	iconSrc,
	altText,
	filename,
	date,
	size,
	onClick,
	onDelete,
	dirPath
}) => {
	const [isOpen, setOpen] = useState(false)

	console.log(dirPath)
	return (
		<>
			<div className="file-show-line" onClick={onClick} >
				<div className="icon-placement">
					<img className="icon" src={iconSrc} alt={altText ? altText : ''}></img>
				</div>
				<div className="filename-with-date">
					<div className="filename">{filename}</div>
					<div className="date">{date}</div>
				</div>
				{/* TODO remove inline styles */}
				<div onClick={(event) => { event.stopPropagation(); onDelete(); }} >Delete</div>
				{dirPath && dirPath.split('/').length == 2 ? <div onClick={(event) => { event.stopPropagation(); setOpen(true); }} >Share</div> : null}
				<div className="size">{size}</div>
				<SharedModal isOpen={isOpen} close={() => setOpen(false)} dirPath={dirPath}></SharedModal>
			</div>
		</>
	);
}
