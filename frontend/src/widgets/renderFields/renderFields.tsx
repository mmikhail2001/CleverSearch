import { Modal } from '@feature/modal/modal';
import { ViewImg } from '@feature/showFiles/viewImg/viewImg';
import { ViewPDF } from '@feature/showFiles/viewPDF/pdfViewer';
import { VideoPlayer } from '@feature/videoPlayer/videoPlayer';
import documentIconPath from '@icons/files/Book.svg';
import folderIconPath from '@icons/files/Folder.svg';
import imageIconPath from '@icons/files/image.svg';
import { AccessRights, fileFile, getAccessRights } from '@models/searchParams';
import { SerializedError, UnknownAction } from '@reduxjs/toolkit';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { changeDir } from '@store/currentDirectoryAndDisk';
import React, { Dispatch, FC } from 'react';
import { FileWithModal, renderReturns } from './fileWithModal';
import './renderFields.scss';

export interface RenderFieldsProps {
	data: fileFile[],
	error: FetchBaseQueryError | SerializedError,
	isError: boolean,
	isLoading: boolean,
	dispatch: Dispatch<UnknownAction>,
	deleteFile: (fileName: string, accessRights: AccessRights) => void,
	openFolder: (dirToShow: string[]) => void,
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
				<Modal
					className={'modal__pdf-show'}
					isOpen={state}
					closeModal={() => changeState(false)}
					bodyClassName={'modal-body__pdf'}
				>
					<ViewPDF pdfURL={file.link} openPageInPDF={file.page_number || 0} searchString={''}></ViewPDF>
				</Modal>
			)
		}
		const imgSrc = documentIconPath;
		return { clickHandler: () => { }, imgSrc, renderModal }
	};

	const getVideoProps = (file: fileFile, state: boolean, changeState: (whatToState: boolean) => void): renderReturns => {
		const renderModal = () => {
			return (
				<Modal className={'modal__video-show'} isOpen={state} closeModal={() => changeState(false)}>
					<VideoPlayer
						url={file.link}
						duration={file.duration || 0}
						start_time={file.start_time || 0}
					></VideoPlayer>
				</Modal>
			)
		}
		const imgSrc = documentIconPath;
		return { clickHandler: () => { }, imgSrc, renderModal }
	};

	return (
		<div key={'rendered-list'} className='show-all-files'>
			{data.map((file) => {
				const getFileProps = (file: fileFile, isOpen: boolean, changeState: (isOpen: boolean) => void): renderReturns => {
					let renderModal: () => React.ReactNode | null = () => null;
					let clickHandler: () => void;
					let iconSrc = '';

					if (file.is_dir) {
						const props: renderReturns = getDirProps(file);

						iconSrc = props.imgSrc;
						clickHandler = props.clickHandler
						renderModal = props.renderModal
					} else {
						let props: renderReturns;

						switch (file.file_type) {
							case 'img':
								props = getImageProps(file, isOpen, changeState);

								iconSrc = props.imgSrc
								clickHandler = props.clickHandler
								renderModal = props.renderModal
								break;
							case 'text':
								props = getPdfProps(file, isOpen, changeState);

								iconSrc = props.imgSrc
								clickHandler = props.clickHandler
								renderModal = props.renderModal
								break;
							case 'video':
							case 'audio':
								props = getVideoProps(file, isOpen, changeState);

								iconSrc = props.imgSrc
								clickHandler = props.clickHandler
								renderModal = props.renderModal
								break;

							default:
								iconSrc = imageIconPath;


						}
					}
					return {
						clickHandler, imgSrc: iconSrc, renderModal
					}
				}

				return <FileWithModal
					key={file.id}
					file={file}
					deleteFile={(filePath) => deleteFile(filePath, getAccessRights(file.share_access))}
					getFileProps={getFileProps}
				/>
			}
			)}
		</div>
	);
};

