import { fileFile } from '@models/searchParams';
import { SerializedError, UnknownAction } from '@reduxjs/toolkit';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { changeDir } from '@store/currentDirectoryAndDisk';
import { FileShow } from '@ui/fileShow/fileShow';
import React, { Dispatch, FC, useEffect, useState } from 'react';
import folderIconPath from '@icons/files/Folder.svg';
import documentIconPath from '@icons/files/Book.svg';
import imageIconPath from '@icons/files/image.svg';

export interface RenderFieldsProps {
	data: fileFile[],
	error: FetchBaseQueryError | SerializedError,
	isError: boolean,
	isLoading: boolean,
	dispatch: Dispatch<UnknownAction>,
	deleteFile: (fileName: string) => void,
	openFolder: (dirToShow: string) => void,
}


export const RenderFields: FC<RenderFieldsProps> = ({
	data,
	error,
	isError,
	isLoading,
	dispatch,
	deleteFile,
	openFolder,
}) => {
	if (isLoading) {
		return <h1>Подождите, загружаем файлы...</h1>;
	}

	if (isError) {
		return <h1>Произошла ошибка ${JSON.stringify(error)}</h1>;
	}

	if (!data || data.length === 0) {
		return <div>Ничего нет</div>;
	}

	return (
		<div>
			{data.map((file) => {

				let iconSrc = '';
				let clickHandler: () => void;
				if (file.is_dir) {
					iconSrc = folderIconPath;
					clickHandler = () => {
						dispatch(
							changeDir({
								dirs: file.path.split('/'),
								current: file.path.split('/')[-1],
							}));
						openFolder(file.path);
					};
				} else {
					clickHandler = () => { }
					const splits = file['content_type']?.split('/');
					if (splits?.length > 0) {
						switch (splits[1]) {
							case 'pdf':
								iconSrc = documentIconPath;
								break;
							default:
								iconSrc = imageIconPath;
						}
					}
				}


				return (
					<>
						<FileShow
							key={file.id}
							iconSrc={iconSrc}
							altText={file.is_dir ? 'folder' : 'file'}
							filename={file.is_dir ? file.path.split('/').pop() : file.filename}
							date={file.date}
							size={file.size}
							isOpen={false}
							url={file.link}
							pageNumber={0}
							onClick={clickHandler}
							onDelete={() => deleteFile(file.path)}
						></FileShow>
					</>
				);
			})}
		</div>
	);
};

