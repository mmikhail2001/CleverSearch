import React, { FC, useState } from 'react';
import './fileShow.scss';
import { ModalWithPDF } from '@modules/modalWithPdf/modalWithPdf';

interface FileShowProps {
	iconSrc: string;
	altText?: string;
	filename: string;
	date: string; // TODO think about change to date type
	size: string;
	onClick?: () => void;
	onDelete: () => void;
	isOpen: boolean;
	url: string;
	pageNumber?: number;
	isModalExist: boolean
}

export const FileShow: FC<FileShowProps> = ({
	iconSrc,
	altText,
	filename,
	date,
	size,
	onClick,
	onDelete,
	url,
	pageNumber,
	isModalExist
}) => {
	const [isOpen, setOpen] = useState(false)

	return (
		<>
			<div className="file-show-line" onClick={() => setOpen(true)} >
				<div className="icon-placement">
					<img className="icon" src={iconSrc} alt={altText ? altText : ''}></img>
				</div>
				<div className="filename-with-date" onClick={onClick}>
					<div className="filename">{filename}</div>
					<div className="date">{date}</div>
				</div>
				<div onClick={() => { onDelete() }}>Delete</div>
				<div className="size">{size}</div>
			</div>
			{isModalExist ? <ModalWithPDF isOpen={isOpen} close={() => setOpen(false)} pdfURL={url} pageNumber={pageNumber}></ModalWithPDF> : null}
		</>
	);
}
