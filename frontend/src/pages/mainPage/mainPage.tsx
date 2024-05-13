import { Sidebar } from '@widgets/sidebar/sidebar';
import React, { FC, useEffect, useState } from 'react';

import { useDispatch } from 'react-redux';
import { switchToLoved, switchToShow } from '@store/whatToShow';

import { useWebSocket } from '@helpers/hooks/useWebsocket'
import { Navbar } from '@widgets/navbar/navbar';
import { Outlet, useNavigate } from 'react-router-dom';
import './mainPage.scss';
import { useMobile } from 'src/mobileProvider';
import { changeDir, changeDisk, newValues } from '@store/showRequest';

import FavoriteIcon from '@mui/icons-material/Favorite';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import MonitorSVG from '@icons/disks/Monitor.svg';
import { getInternalURLFront } from '@helpers/transformsToURL';
import { useAppSelector } from '@store/store';

import Fab from '@mui/material/Fab';
import CameraAltRoundedIcon from '@mui/icons-material/CameraAltRounded';
import {ComponentWithInput} from '@entities/componentWithInput/componentWithInput'
import { debounce } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import { useGetInternalFilesMutation, useGetSharedFilesMutation, usePushFileMutation } from '@api/filesApi';
import { correctFormats, isCorrectFormat } from '@helpers/isCorrectFormat';
import { notificationBar } from '@helpers/notificationBar';
import { fileUploadNotification } from '@helpers/fileUploadNotification';

const drawerWidth = '294px'

export const MainPage: FC = () => {
	useWebSocket()

	const { whatDisplay } = useMobile()
	const {isLoved, isShow, isShared} = useAppSelector(state => state.whatToShow)
	const [openSidebar, setOpenSidebar] = useState<boolean>(false)
	
	const navigate = useNavigate()
	const dispatch = useDispatch()

	
	const showReq = useAppSelector(state => state.showRequest)
	const [show] = useGetInternalFilesMutation({ fixedCacheKey: 'show' });
	const [showShared] = useGetSharedFilesMutation({ fixedCacheKey: 'shared' });
	
	const [send, sendResp] = usePushFileMutation();

	const [filesWasSend, setFilesWasSend] = useState<boolean>(false) 
	const {fileToNotify} = useAppSelector(state => state.fileProcess)

	useEffect(() =>{
		if (sendResp && sendResp.isSuccess && filesWasSend) {
			if (isShow) {
				show(showReq.dir.join('/'));
				dispatch(newValues({...showReq}))
			} else if (isShared) {
				showShared(showReq.dir.join('/'));
				dispatch(newValues({...showReq}))
			}

			setFilesWasSend(false)
		}

	}, [filesWasSend,sendResp])

	const isMobile = whatDisplay === 2
	const widthToSet = isMobile ? '0px' : drawerWidth

	fileUploadNotification(fileToNotify)

	return <div className="App">
		<Sidebar
			width={isMobile ? '100%' : drawerWidth}
			isMobile={isMobile}
			isOpen={openSidebar}
			toggleShow={setOpenSidebar}
		/>
		<div
			className="main-app"
			style={{
				marginLeft: isMobile ? 0 : drawerWidth,
				maxWidth: `calc(100% - ${widthToSet})`,
			}}
		>
			<Navbar
				toggleSidebar={() =>
					setOpenSidebar(!openSidebar)
				}
			/>
			<Outlet></Outlet>
		</div>
		{whatDisplay !== 1 
			? <Fab
				variant='circular'
				sx={{
					position:'absolute',
					height: '40px',
					width: '40px',
					bottom: '48px',
					right: '16px',
					background: 'var(--color-dropdowns)',
					color: 'inherit',
					border: '1px solid rgba(255, 255, 255, 0.5)',
				}}
			>
				<ComponentWithInput
					accept={correctFormats}
					stylesOnComponent={{
						display:'flex',
						fontSize:'24px',
						height:'100%',
						width:'100%',
						justifyContent: 'center',
						alignItems: 'center',
					}}
					capture='environment'
					disabled={false}
					onChange={
						(files: FileList) => {
							const debouncFunc = debounce(() => {
								setFilesWasSend(true)
							}, 300);
							
							Array.from(files).forEach((file) => {
								if (!isCorrectFormat(file.type)) {
									notificationBar({
										children: `File type not supported. Can't upload file: ${file.name}`,
										variant: 'error'
									})
									return
								}
								
								const formData = new FormData();

								formData.append('file', file, file.name);
								formData.append('dir', ['', ...showReq.dir].join('/'));
								send(formData);
								debouncFunc();
							});
						}
					}
				>
					{filesWasSend 
						? <CircularProgress color='inherit'/>
						: <CameraAltRoundedIcon fontSize='inherit' />
					}
				</ComponentWithInput>
			</Fab>
			: null
		}
		{whatDisplay !== 1
			? <div className='bottom-buttons'>
				<div className={['bottom-button', isShow ? 'selected-bottom-button':null].join(' ')}>
					<img
						style={{height: '3rem', width: '3rem'}}
						src={MonitorSVG}
						onClick={() => {
							dispatch(switchToShow())
							dispatch(changeDisk('internal'))
							dispatch(changeDir( [] ))
							navigate(getInternalURLFront([]))
						}}
					/>
				</div>
				<div className={['bottom-button', isShared ? 'selected-bottom-button':null].join(' ')}>
					<PeopleAltIcon
						onClick={() => {
							dispatch(switchToShow())
							dispatch(changeDisk('internal'))
							navigate('/shared')
						}}
						fontSize='inherit'
					/>
				</div>
				<div className={['bottom-button', isLoved ? 'selected-bottom-button':null].join(' ')}>
					<FavoriteIcon
						onClick={() => 
							{
								dispatch(switchToLoved())
								dispatch(changeDisk('internal'))
								dispatch(changeDir( [] ))
								navigate('/loved')
							}
						} 
						fontSize='inherit'
					/>
				</div>
			</div>
			: null
		}
	</div>
};
