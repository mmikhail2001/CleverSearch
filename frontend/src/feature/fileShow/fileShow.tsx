import React, { FC, useRef, useState } from 'react';
import './fileShow.scss';
import { SharedModal } from '@widgets/sharedModal/sharedModal'
import { DropDown } from '@entities/dropDown/dropDown'
import { Typography } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';

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
	config: { isDelete?: boolean, isShare?: boolean },
	onFavourite?: () => void,
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
	onFavourite,
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
						<Typography fontSize={'var(--ft-body)'} className="filename">{filename}</Typography>
						<Typography fontSize={'var(--ft-body)'} className="date">{date}</Typography>
					</div>
				</div>
				<Typography fontSize={'var(--ft-body)'}>{author}</Typography>
				<div className='additional-functions-file'>
					<DropDown
						variants='down-center'
						open={isOpenDropDown}
						toggleOpen={(val) => {
							setOpenDropDown(val);
						}}
						mainElement={
							<div style={{
								display: 'flex',
								alignItems: 'center',
								fontSize: 'var(--ft-paragraph)',
							}}>
								<MoreVertIcon fontSize={'inherit'}></MoreVertIcon>
							</div>}
					>
						{config.isDelete ?
							<div onClick={(event) => {
								event.stopPropagation();
								onDelete();
								setOpenDropDown(false)
							}}>Удалить</div>
							: null}
						<div className={'not-done'} onClick={onFavourite}>
							В Избранное
						</div>
						{config.isShare ?
							<div
								onClick={(event) => {
									event.stopPropagation();
									setOpen(true);
									setOpenDropDown(false)
								}}
							>
								Поделиться
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

				<Typography fontSize={'var(--ft-body)'} className="size">{size === '0 B' ? null : size}</Typography>
			</div>
		</>
	);
}
