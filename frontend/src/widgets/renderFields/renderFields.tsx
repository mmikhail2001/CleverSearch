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
import React, { Dispatch, FC } from 'react';
import { FileWithModal, renderReturns } from './fileWithModal';
import './renderFields.scss';
import { Typography } from '@mui/material';
import { useAppSelector } from '@store/store';
import {getErrorMessageFromErroResp} from '@helpers/getErrorMessageFromErroResp'
import { useMobile } from 'src/mobileProvider';
import { diskTypes } from '@models/disk';
import { ConnectedClouds } from '@models/user';

export interface RenderFieldsProps {
	data: fileFile[],
	error: FetchBaseQueryError | SerializedError,
	isError: boolean,
	isLoading: boolean,
	dispatch: Dispatch<UnknownAction>,
	deleteFile: (fileName: string, accessRights: AccessRights) => void,
	openFolder: (dirToShow: string[], diskToShow: diskTypes | ConnectedClouds) => void,
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
	const disks = useAppSelector(state => state.disks)
	const {whatDisplay} = useMobile()
	const isMobile = whatDisplay === 2

	if (isLoading) {
		return <h1>Подождите, загружаем файлы...</h1>;
	}

	if (isError) {
			return <h1>{getErrorMessageFromErroResp(error)}</h1>;
		}

	if (!data || data.length === 0) {
		return <div>Нет никаких файлов :(</div>;
	}

	const getDirProps = (file: fileFile): renderReturns => {
		const imgSrc = folderIconPath;
		const clickHandler = () => {
			const dirsPath = file.path.split('/')
			let disk: diskTypes | ConnectedClouds = 'all';
			if (file.cloud_email !== '') {
				disk = {
					cloud_email:file.cloud_email, 
					disk: file.disk,
					access_token: '',
				}
			}
			
			openFolder(dirsPath, disk);
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
					isFullWidth={true}
					className={'modal__pdf-show'}
					isOpen={state}
					closeModal={() => changeState(false)}
					bodyClassName={'modal-body__pdf'}
				>
					<ViewPDF
						pdfURL={file.link}
						openPageInPDF={file.page_number || 0}
					/>
				</Modal>
			)
		}
		const imgSrc = documentIconPath;
		return { clickHandler: () => { }, imgSrc, renderModal }
	};

	const getVideoProps = (file: fileFile, state: boolean, changeState: (whatToState: boolean) => void): renderReturns => {
		const renderModal = () => {
			// TODO видео уезжает, зажать по высоте
			return (
				<Modal className={'modal__video-show'} isOpen={state} closeModal={() => changeState(false)}>
					<VideoPlayer
						url={file.link}
						duration={file.duration || 0}
						start_time={file.timestart || 0}
					></VideoPlayer>
				</Modal>
			)
		}
		const imgSrc = documentIconPath;
		return { clickHandler: () => { }, imgSrc, renderModal }
	};

	return (
		<div key={'rendered-list'} className='show-all-files'>
			<div className='file-show-line'>
				<Typography fontWeight={600} fontSize={'var(--ft-paragraph)'}>Название</Typography>
				<Typography fontWeight={600} fontSize={'var(--ft-paragraph)'}>Автор</Typography>
				<Typography fontWeight={600} fontSize={'var(--ft-paragraph)'}></Typography>
				{isMobile 
				? null 
				:<Typography fontWeight={600} fontSize={'var(--ft-paragraph)'}>Размер</Typography>
				}
			</div>
			{data.map((file) => {
				const getFileProps = (file: fileFile, isOpen: boolean, changeState: (isOpen: boolean) => void): renderReturns => {
					let renderModal: () => React.ReactNode | null = () => null;
					let clickHandler: () => void;
					let iconSrc = '';

					if (file.is_dir) {
						const dirProp: renderReturns = getDirProps(file);

						iconSrc = dirProp.imgSrc;
						clickHandler = dirProp.clickHandler
						renderModal = dirProp.renderModal
					} else {
						let fileProp: renderReturns;
						
						switch (file.file_type) {
							case 'img':
								fileProp = getImageProps(file, isOpen, changeState);

								iconSrc = fileProp.imgSrc
								clickHandler = fileProp.clickHandler
								renderModal = fileProp.renderModal
								break;
							case 'text':
								fileProp = getPdfProps(file, isOpen, changeState);

								iconSrc = fileProp.imgSrc
								clickHandler = fileProp.clickHandler
								renderModal = fileProp.renderModal
								break;
							case 'video':
							case 'audio':
								fileProp = getVideoProps(file, isOpen, changeState);

								iconSrc = fileProp.imgSrc
								clickHandler = fileProp.clickHandler
								renderModal = fileProp.renderModal
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

