import { FileShow } from '@feature/fileShow/fileShow';
import React, { FC, useState } from 'react';
import './renderFields.scss';
import { useAddToFavouriteMutation, useDeleteToFavouriteMutation } from '@api/filesApi';
import { useAppSelector } from '@store/store';
import { fileFile } from '@models/files';
import { renderReturns } from '@helpers/getPropsForFile';

export interface FileWithModalProps {
	file: fileFile,
	deleteFile: (fileName: string) => void,
	getFileProps: (file: fileFile, isOpen: boolean, changeState: (isOpen: boolean) => void) => renderReturns,
}

export const FileWithModal: FC<FileWithModalProps> = ({
	file,
	deleteFile,
	getFileProps,
}) => {
	const [deleteFavourite, respDeleteFavourite] = useDeleteToFavouriteMutation()
	const [addFavourite, respAddFavourite] = useAddToFavouriteMutation()

	const [isOpen, setOpen] = useState(false)

	const fileProp: renderReturns = getFileProps(file, isOpen, (isOpen) => { setOpen(isOpen) })
	const { renderModal, clickHandler, imgSrc: iconSrc } = fileProp
	
	const splitPath = file.path.split('/')
	const dirPath = file.is_dir ? file.path : ''

	const {isLoved} = useAppSelector(state => state.whatToShow)

	const canBeDeleted = (file: fileFile): boolean => {
		return !file.is_shared
			|| file.is_shared && file.share_access === 'writer'
	}

	let fileFav: boolean;
	// Были оба запроса
	if (respAddFavourite.isSuccess && respDeleteFavourite.isSuccess) {
		if (respAddFavourite.fulfilledTimeStamp > respDeleteFavourite.fulfilledTimeStamp) {
			fileFav = true
		} else {
			fileFav = false
		}
	} else {
		if (respAddFavourite.isSuccess) {
			fileFav = true
		}
		if (respDeleteFavourite.isSuccess) {
			fileFav = false
		}
	}
	// Не было запросов
	if (!respAddFavourite.isSuccess && !respDeleteFavourite.isSuccess) {
		fileFav = file.is_fav
	}

	const onFavouriteClick = () => {
		if (fileFav) {
			deleteFavourite(file.id)
		} else {
			addFavourite(file.id)
		}
	}

	const renderFile = (): React.ReactNode => {
		return <>
			<FileShow
				key={file.id}
				author={file.email}
				onFavourite={onFavouriteClick}
				iconSrc={iconSrc}
				altText={file.is_dir ? 'folder' : 'file'}
				filename={file.is_dir ? splitPath[splitPath.length - 1] : file.filename}
				date={file.time_created}
				size={file.size}
				onDelete={() => deleteFile(file.path)}
				onClick={() => { setOpen(true); clickHandler() }}
				dirPath={dirPath}
				config={{
					isDelete: canBeDeleted(file),
					isShare: dirPath && dirPath.split('/').length == 2,
					shareAccess: file.share_access,
					isCanBeLoved: !file.is_dir,
					isLoved: fileFav,
				}}
			></FileShow>
			{renderModal()}
		</>
	}

	const needRender = isLoved ? isLoved && fileFav : true

	return (
		<>
			{needRender ? renderFile(): null}
		</>
	);

};

