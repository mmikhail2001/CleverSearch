import React, { FC, useRef, useState } from 'react';
import './fileShow.scss';
import { SharedModal } from '@widgets/sharedModal/sharedModal'
import { DropDown } from '@entities/dropDown/dropDown'
import { Typography } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useMobile } from 'src/mobileProvider';
import { getAvatarByEmail } from '@api/userApi';

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
	config: { isDelete?: boolean, isShare?: boolean, isLoved?: boolean, isCanBeLoved?: boolean },
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
	const {whatDisplay} = useMobile()
	const ref = useRef<HTMLDivElement>(null)

	const isMobile = whatDisplay === 2

	const handleClickFile = (e: React.MouseEvent<HTMLElement>): void => {
		if (ref?.current && ref.current.contains(e.target as Node))
			onClick();
	}

	const renderDropDown = (): React.ReactNode => {
		return <DropDown
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
			{config.isCanBeLoved ? 
			<div onClick={onFavourite}>
				{!config.isLoved ? "В Избранное" : "Убрать из избранного"}
			</div>
			: null
			}
			{config.isShare ?
				<React.Fragment>
					<div
						onClick={(event) => {
							event.stopPropagation();
							setOpen(true);
							// setOpenDropDown(false)
						}}
					>
						Поделиться
					</div>
				</React.Fragment>
				: null}
		</DropDown>
	}

	return (
		<>
			<div className="file-show-line" ref={ref} onClick={handleClickFile} >
				<div className='container-file-info'>
					<div className="icon-placement">
						<img className="icon" src={iconSrc} alt={altText ? altText : ''}></img>
					</div>
					<div className="filename-with-date">
						<Typography fontSize={'var(--ft-body)'} className="filename">{filename}</Typography>
						{
							isMobile 
							?<Typography fontSize={'var(--ft-body)'} className="date">{date}</Typography>
							:null 
						}
						
					</div>
				</div>
				
				{isMobile ? null :
					<div className='file-show__date'>
						{date}
					</div>
				}

				<div className='file-show__author-position'>
				{author !== "" 
				? <img className='file-show__author' src={getAvatarByEmail(author)} /> 
				: null
				}
				</div>
				
				{isMobile
				? null 
				: <Typography fontSize={'var(--ft-body)'} className="size">{size === '0 B' ? null : size}</Typography> 
				}

				<div className='additional-functions-file'>
					{renderDropDown()}
				</div>
				{config.isShare 
				?
				<SharedModal
					isOpen={isOpen}
					close={() => {
						setOpen(false);
						setOpenDropDown(false);
					}}
					dirPath={dirPath}
				/>
				: null
				}
				
			</div>
		</>
	);
}
