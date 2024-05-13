import { AccessRights, getAccessRights } from '@models/searchParams';
import { SerializedError } from '@reduxjs/toolkit';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import React, { FC } from 'react';
import { FileWithModal } from './fileWithModal';
import './renderFields.scss';
import { Typography } from '@mui/material';
import {getErrorMessageFromErroResp} from '@helpers/getErrorMessageFromErroResp'
import { useMobile } from 'src/mobileProvider';
import { diskTypes } from '@models/disk';
import { ConnectedClouds } from '@models/user';
import AccessibleForwardRoundedIcon from '@mui/icons-material/AccessibleForwardRounded';
import { fileFile } from '@models/files';
import { isNullOrUndefined } from '@helpers/isNullOrUndefined';

import CircularProgress from '@mui/material/CircularProgress';
import NothingSVG from '@icons/Nothing.svg'

import {renderReturns, getDirProps, getPdfProps, getVideoProps, getImageProps} from '@helpers/getPropsForFile'
import { GetErrorElementOnBugShow } from '@feature/errorElements/index';

export interface RenderFieldsProps {
	height?:string,
	data: fileFile[],
	error: FetchBaseQueryError | SerializedError,
	isError: boolean,
	isLoading: boolean,
	deleteFile: (fileName: string, accessRights: AccessRights) => void,
	openFolder: (dirToShow: string[], diskToShow: diskTypes | ConnectedClouds) => void,
	noResultsElement?: React.ReactNode, 
}

const renderHeader = (isMobile: boolean):React.ReactNode => {
	return (
		<div className='file-show-line header-line' style={{cursor: 'default'}}>
			<Typography fontWeight={400} fontSize={'var(--ft-pg-24)'}>Name</Typography>
			
			{isMobile ? null 
			: <Typography fontWeight={400} fontSize={'var(--ft-pg-24)'}>Created date</Typography>
			}
			
			<Typography fontWeight={400} fontSize={'var(--ft-pg-24)'}>Author</Typography>
			
			{isMobile 
			? null 
			:<Typography fontWeight={400} fontSize={'var(--ft-pg-24)'}>Size</Typography>
			
			}
			<Typography fontWeight={400} fontSize={'var(--ft-pg-24)'}></Typography>
			
		</div>
	)
}

export const RenderFields: FC<RenderFieldsProps> = ({
	height,
	data,
	error,
	isError,
	isLoading,
	deleteFile,
	openFolder,
	noResultsElement,
}) => {
	const {whatDisplay} = useMobile()
	const isMobile = whatDisplay !== 1

	if (isError) {
			return <GetErrorElementOnBugShow 
				error={getErrorMessageFromErroResp(error)}
			/>
		}

	if (isLoading) {
		return (
			<div key={'rendered-list'} className='show-all-files' style={{height: height}}>
				{renderHeader(isMobile)}
				<div style={{
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
				}}>
					<CircularProgress color='inherit' />
				</div>
			</div>
		)
	}

	if ((isNullOrUndefined(data) || !data || data.length === 0 && !isLoading)) {
		return noResultsElement
	}

	return (
		<div key={'rendered-list'} className='show-all-files' style={{height: height}}>
			{renderHeader(isMobile)}
			{data.map((file) => {
				const getFileProps = (file: fileFile, isOpen: boolean, changeState: (isOpen: boolean) => void): renderReturns => {
					let fileProp: renderReturns;
					
					if (file.is_dir) {
						fileProp = getDirProps(file, openFolder);
					} else {						
						switch (file.file_type) {
							case 'img':
								fileProp = getImageProps(file, isOpen, changeState);
								break;

							case 'text':
								fileProp = getPdfProps(file, isOpen, changeState);
								break;

							case 'video':
							case 'audio':
								fileProp = getVideoProps(file, isOpen, changeState);
								break;
							default:
								fileProp = {
									clickHandler: () => {},
									imgSrc: <AccessibleForwardRoundedIcon fontSize='inherit' sx={{color:'#4285F4'}}/>,
									renderModal: () => {return <></>}
								}
						}
					}
					
					return {
						...fileProp,
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

