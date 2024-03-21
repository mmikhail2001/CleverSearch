import { fileFile } from '@models/searchParams';
import { SerializedError, UnknownAction } from '@reduxjs/toolkit';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { changeDir } from '@store/currentDirectoryAndDisk';
import { FileShow } from '@feature/fileShow/fileShow';
import React, { Dispatch, FC, useState } from 'react';
import folderIconPath from '@icons/files/Folder.svg';
import documentIconPath from '@icons/files/Book.svg';
import imageIconPath from '@icons/files/image.svg';
import { ViewPDF } from '@feature/showFiles/viewPDF/viewPDF';
import { Modal } from '@feature/modal/modal'
import { ViewImg } from '@feature/showFiles/viewImg/viewImg';
import './renderFields.scss'

export interface RenderFieldsProps {
	data: fileFile[],
	error: FetchBaseQueryError | SerializedError,
	isError: boolean,
	isLoading: boolean,
	dispatch: Dispatch<UnknownAction>,
	deleteFile: (fileName: string) => void,
	openFolder: (dirToShow: string[]) => void,
}

interface renderReturns {
	renderModal: () => React.ReactNode | null;
	clickHandler: () => void;
	imgSrc: string;
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

	const getDirProps = (file: fileFile): renderReturns => {
		const imgSrc = folderIconPath;
		const clickHandler = () => {
			const dirsPath = file.path.split('/')
			dispatch(
				changeDir({
					dirs: dirsPath,
				}));
			openFolder(dirsPath);
		};
		const renderModal = (): null => null
		return { imgSrc, clickHandler, renderModal }
	};

	const getImageProps = (file: fileFile, state: boolean, changeState: (whatToState: boolean) => void): renderReturns => {
		const renderModal = () => {
			return (
				<Modal className={'modal__img-show'} isOpen={state} closeModal={() => changeState(false)}>
					<ViewImg imgSrc={file.link} altText={''} />
				</Modal>
			)
		}
		const imgSrc = imageIconPath;
		const clickHandler = (): null => null;
		return { clickHandler, imgSrc, renderModal }
	};

	const getPdfProps = (file: fileFile, state: boolean, changeState: (whatToState: boolean) => void): renderReturns => {
		const renderModal = () => {
			return (
				<Modal className={'modal__pdf-show'} isOpen={state} closeModal={() => changeState(false)}>
					<ViewPDF pdfURL={file.link} openPageInPDF={0} searchString={''}></ViewPDF>
				</Modal>
			)
		}
		const imgSrc = documentIconPath;
		return { clickHandler: () => { }, imgSrc, renderModal }
	};

	return (
		<div>
			{data.map((file) => {
				const [isOpen, setOpen] = useState(false)

				let renderModal: () => React.ReactNode | null = () => null;
				let clickHandler: () => void;
				let iconSrc = '';

				if (file.is_dir) {
					const props: renderReturns = getDirProps(file);

					iconSrc = props.imgSrc;
					clickHandler = props.clickHandler
					renderModal = props.renderModal
				} else {
					const splits = file.filename?.split('.');
					if (splits?.length > 0) {
						let props: renderReturns;
						switch (splits[1]) {
							case 'pdf':
								props = getPdfProps(file, isOpen, (whatToState) => setOpen(whatToState));

								iconSrc = props.imgSrc
								clickHandler = props.clickHandler
								renderModal = props.renderModal
								break;
							case 'png':
							case 'img':
							case 'jpg':
								props = getImageProps(file, isOpen, (whatToState) => setOpen(whatToState));

								iconSrc = props.imgSrc
								clickHandler = props.clickHandler
								renderModal = props.renderModal
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
							onDelete={() => deleteFile(file.path)}
							onClick={() => { setOpen(true); clickHandler() }}
							dirPath={file.is_dir ? file.path : ''}
						></FileShow>
						{renderModal()}
					</>
				);
			})}
		</div>
	);
};

