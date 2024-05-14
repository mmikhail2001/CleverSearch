import React, { FC, useRef, useState } from 'react';
import './fileShow.scss';
import { SharedModal } from '@widgets/sharedModal/sharedModal'
import { DropDown } from '@entities/dropDown/dropDown'
import { Typography } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useMobile } from 'src/mobileProvider';
import { getAvatarByEmail } from '@api/userApi';

import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import ModeRoundedIcon from '@mui/icons-material/ModeRounded';
import LibraryBooksRoundedIcon from '@mui/icons-material/LibraryBooksRounded';

interface FileShowProps {
	iconSrc: string | React.ReactNode;
	altText?: string;
	filename: string;
	date: string;
	size: string;
	onClick?: () => void;
	onDelete: () => void;
	dirPath?: string
	author: string,
	config: { 
		isDelete?: boolean, 
		isShare?: boolean, 
		isLoved?: boolean, 
		isCanBeLoved?: boolean,
		shareAccess?: string,
	},
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
				<div key={'delete_btn'} onClick={(event) => {
					event.stopPropagation();
					onDelete();
					setOpenDropDown(false)
				}}>Remove</div>
				: null}
			{config.isCanBeLoved ? 
			<div key={'remove_btn'} onClick={onFavourite}>
				{!config.isLoved ? 'To Favourite' : 'Remove from Favourite'}
			</div>
			: null
			}
			{config.isShare ?
					<div 
						key={'share_btn'}
						onClick={(event) => {
							event.stopPropagation();
							setOpen(true);
						}}
					>
						Share
					</div>
				: null}
		</DropDown>
	}

	const renderShareIcon = (): null | React.ReactNode => {
		if (!config.isShare || config.shareAccess === '') return null
		switch(config.shareAccess) {
			case 'writer': 
			return <ModeRoundedIcon 
					fontSize='medium' 
					sx={{
						borderRadius: '2.5rem',
						color: 'var(--color-dropdowns)',
						position: 'absolute',
						top:"50%",
						left: '50%',
						transform: 'translate(-50%, -50%)',
					}}
				/>
			case 'reader': 
				return <LibraryBooksRoundedIcon 
					fontSize='medium' 
					sx={{
						borderRadius: '2.5rem',
						color: 'var(--color-dropdowns)',
						position: 'absolute',
						top:"50%",
						left: '50%',
						transform: 'translate(-50%, -50%)',
					}}
				/>
			default:
				return null
		}
	}

	return (
		<>
			<div className="file-show-line" ref={ref} onClick={handleClickFile} >
				<div className='container-file-info'>
					<div className="icon-placement">
						{
							typeof iconSrc ==='string' 
							? <img className="icon" src={iconSrc} alt={altText ? altText : ''}></img>
							: iconSrc
						}
						{config.isLoved 
						? <FavoriteRoundedIcon 
							fontSize='medium' 
							sx={{
								boxShadow: 'inset 0px 0px 7px 10px rgba(0, 0, 0, 0.12)',
    							borderRadius: '2.5rem',
								color: '#F8021F',
								position: 'absolute',
								bottom:"0px",
								right: '0px',
							}}
						/>
						: null}
						{renderShareIcon()}
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
						<Typography fontSize={'var(--ft-body)'}>{date}</Typography>
					</div>
				}

				<div className='file-show__author-position'>
				{author !== '' 
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
