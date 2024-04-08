import React, { FC, useRef, useState } from 'react';
import './fileShow.scss';
import { SharedModal } from '@widgets/sharedModal/sharedModal'
import { DropDown } from '@entities/dropDown/dropDown'
import { Typography } from '@mui/material';

interface FileShowProps {
	iconSrc: string;
	altText?: string;
	filename: string;
	date: string;
	size: string;
	onClick?: () => void;
	onDelete: () => void;
	dirPath?: string
	author: string,
	config: { isDelete?: boolean, isShare?: boolean }
}

export const FileShow: FC<FileShowProps> = ({
	iconSrc,
	altText,
	filename,
	author,
	date,
	size,
	onClick,
	onDelete,
	dirPath,
	config
}) => {
	const [isOpen, setOpen] = useState(false)
	const [isOpenDropDown, setOpenDropDown] = useState(false)

	const handleClickFile = (e: React.MouseEvent<HTMLElement>): void => {
		if (ref?.current && ref.current.contains(e.target as Node))
			onClick();
	}
	const ref = useRef<HTMLDivElement>(null)

	return (
		<>
			<div className="file-show-line" ref={ref} onClick={handleClickFile} >
				<div className='container-file-info'>
					<div className="icon-placement">
						<img className="icon" src={iconSrc} alt={altText ? altText : ''}></img>
					</div>
					<div className="filename-with-date">
						<div className="filename">{filename}</div>
						<div className="date">{date}</div>
					</div>
				</div>
				<div>{author}</div>
				<div className='additional-functions-file'>
					<DropDown
						open={isOpenDropDown}
						toggleOpen={(val) => {
							setOpenDropDown(val);
						}}
						mainElement={<div>More</div>}
					>
						{config.isDelete ?
							<div onClick={(event) => {
								event.stopPropagation();
								onDelete();
								setOpenDropDown(false)
							}} >Delete</div>
							: null}
						{config.isShare ?
							<div
								onClick={(event) => {
									event.stopPropagation();
									setOpen(true);
									setOpenDropDown(false)
								}}
							>
								Share
							</div>
							: null}
					</DropDown>
				</div>
				{config.isShare ?
					<SharedModal
						isOpen={isOpen}
						close={() => {
							setOpen(false);
							setOpenDropDown(false);
						}}
						dirPath={dirPath}
					/>
					: null}

				<div className="size">{size}</div>
			</div>
		</>
	);
}
