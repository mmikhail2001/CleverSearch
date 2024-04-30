import { diskTypes } from '@models/disk';
import { switchDisk, switchToLoved, switchToProcessed, switchToShared, switchToShow } from '@store/whatToShow';
import { TextWithImg } from '@feature/textWithImg/textWithimg';
import React, { FC, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import './sidebar.scss';
import { ButtonWithInput } from '@feature/buttonWithInput/buttonWithInput';
import { useGetInternalFilesMutation, useGetSharedFilesMutation, usePushFileMutation } from '@api/filesApi';
import { useAppSelector } from '@store/store';
import { useSearchMutation } from '@api/searchApi';

import { useNavigate } from 'react-router-dom';
import { debounce } from '@helpers/debounce'
import { FolderCreation } from './folderCreation/folderCreation'
import { Drawer } from '@entities/drawer/drawer';
import { Modal } from '@feature/modal/modal';
import { UserProfile } from '@widgets/userProfile/userProfile';
import LogoutIcon from '@mui/icons-material/Logout';
import { Popover, Typography, createTheme } from '@mui/material';
import { useLogout } from '@helpers/hooks/logout';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import { DiskView } from './diskView/diskView'
import { ConnectedClouds } from '@models/user';
import { newValues } from '@store/showRequest';
import {FileUploadNotification} from '@feature/fileUploadNotification/fileUploadNotification'
import { PopOver } from '@entities/popover/popover';
import { Button } from '@entities/button/button';

import RobotSVG from '@icons/Robot.svg';
import DownloadSVG from '@icons/Download.svg';
import FavoriteIcon from '@mui/icons-material/Favorite';
import AddIcon from '@mui/icons-material/Add';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import { transformFromDiskToDiskName } from '@helpers/transformFromDiskToDiskName';
import { getDriveURLFront, getInternalURLFront } from '@helpers/transformsToURL';

interface SidebarProps {
	width: string;
	isMobile?: boolean;
	toggleShow: (state: boolean) => void;
	isOpen: boolean;
}

export const Sidebar: FC<SidebarProps> = ({
	width,
	isMobile,
	toggleShow,
	isOpen,
}) => {
	const { 
		isSearch,
		isShow,
		isProccessed,
		isShared,
		isLoved,
		whatDiskToShow,
		} = useAppSelector((state) => state.whatToShow);

	const dispatch = useDispatch();
	const navigate = useNavigate()

	const [search] = useSearchMutation({ fixedCacheKey: 'search' });
	const [show] = useGetInternalFilesMutation({ fixedCacheKey: 'show' });
	const [showShared] = useGetSharedFilesMutation({ fixedCacheKey: 'shared' });
	
	const showReq = useAppSelector(state => state.showRequest)
	const disks = useAppSelector(state => state.disks)
	const param = useAppSelector((state) => state.searchRequest);

	const [send, sendResp] = usePushFileMutation();
	const { email } = useAppSelector(state => state.userAuth)
	const logout = useLogout()
	const [filesWasSend, setFilesWasSend] = useState<boolean>(false) 

	const [isCreationPopOpen,setCreationPopOpen] = useState<boolean>(false)

	useEffect(() =>{
		if (sendResp && sendResp.isSuccess && filesWasSend) {
			if (isSearch) {
				search(param);
			} else if (isShow) {
				show(showReq.dir.join('/'));
				dispatch(newValues({...showReq}))
			} else if (isShared) {
				showShared(showReq.dir.join('/'));
				dispatch(newValues({...showReq}))
			}

			setFilesWasSend(false)
		}

	}, [filesWasSend,sendResp])

	const renderSidebar = (): React.ReactNode => {
		return (
			<>
				<div className="sidebar" style={{ width: width }}>
					<div className="our-name-place">
						{isMobile ?
							<UserProfile email={email} isDropdownExist={false} />
							:
							<Typography
								onClick={() => dispatch(switchToShow())}
								className={['our-name'].join(' ')}
							>CleverSearch</Typography>
						}
					</div>
					<div className='button_sidebar'>
						<PopOver
							styleMain={{width: '179px'}}
							mainElement={
								<Button
									endIcon={<AddIcon fontSize='inherit'/>}
									isFullSize={true}
									fontSize={'var(--ft-paragraph)'}
									buttonText={'Add'} 
									clickHandler={() => setCreationPopOpen(!isCreationPopOpen) } 
									variant={'contained'}								 
								/>
							}
							open={isCreationPopOpen}
							toggleOpen={setCreationPopOpen}
							isCloseOnSelect={false}
							variants='down'
						>
							{[
								<div
									style={{
										padding: 'var(--normal-padding)',
										gap: 'var(--normal-padding)',
										display: 'flex',
										flexDirection: 'column',
									}}
								>
									<ButtonWithInput
										buttonText="File"
										onChange={(files: FileList) => {
											const debouncFunc = debounce(() => {
												setFilesWasSend(true)
											}, 300);
											
											Array.from(files).forEach((file) => {
												const formData = new FormData();

												formData.append('file', file, file.name);
												formData.append('dir', ['', ...showReq.dir].join('/'));
												send(formData);
												debouncFunc();
											});
										}}
										disabled={false}
										variant={'text'}
									></ButtonWithInput>
									<FolderCreation
										dirs={showReq.dir}
										onFolderCreation={() => {
											if (isSearch) {
												search(param);
											} else if(isShow) {
												show(showReq.dir.join('/'));
												dispatch(newValues({...showReq}))
											} else if (isShared) {
												showShared(showReq.dir.join('/'));
												dispatch(newValues({...showReq}))
											}
										}}
									/>
								</div>
							]}
						</PopOver>
					</div>
					<div className='disk-show'>
						<DiskView
							needSelect={isShow}
							setSelectedState={(disk: diskTypes | ConnectedClouds
							) => {
								dispatch(switchDisk(disk))

								if (!isShow) {
									dispatch(switchToShow())
								}

								if (typeof disk === 'string') {

									const url = getInternalURLFront([])
									navigate(url)
									dispatch(newValues({...showReq,dir:[], disk: disk}))	
									
									return
								}
									
								const email = disks.clouds.find((val) => val.disk === disk.disk).cloud_email
								const url = getDriveURLFront([], email)
								navigate(url)
								dispatch(newValues({...showReq,dir:[], disk: disk}))
							}}
							nameOfSelectedDisk={typeof whatDiskToShow === 'string' ? whatDiskToShow : whatDiskToShow.disk}
						/>
						<TextWithImg
							text="in process"
							className={['text-with-img', 'work-in-progress', isProccessed ? 'selected' : '', 'text-with-img-row'].join(' ')}
							imgSrc={<img src={RobotSVG} style={{color: 'inherit'}}/>}
							altImgText="Робот"
							onClick={() => {
								dispatch(switchToProcessed());
								dispatch(newValues({...showReq, disk: 'internal'}))
								navigate('/uploaded')
							}}
						/>
						<TextWithImg
							text="shared"
							className={['shared', isShared ? 'selected' : '', 'text-with-img-row'].join(' ')}
							imgSrc={<PeopleAltIcon />} // TODO
							altImgText="Картинка с двумя людьми"
							onClick={() => {
								dispatch(switchToShared())
								dispatch(newValues({...showReq, disk: 'internal'}))
								navigate('/shared')
							}}
						/>
						<TextWithImg
							text="favorites"
							className={['loved', isLoved ? 'selected' : '', 'text-with-img-row'].join(' ')}
							imgSrc={<FavoriteIcon sx={{color:"#FF4444", width:'var(--ft-paragraph)',height:'var(--ft-paragraph)'}}/>} 
							altImgText="Сердце"
							onClick={() => {
								dispatch(switchToLoved())
								navigate('/loved')
							}}
						/>
					</div>
					{isMobile
						? <div style={{
							display: 'flex',
							justifyContent: 'space-between',
							marginTop: 'auto',
							width: '100%',
							fontSize: '2.4rem',
						}}>
							<div onClick={logout} style={{
								width: '100%',
								alignItems: 'center',
								display: 'flex',
								flexDirection: 'column',
							}}>
								<LogoutIcon fontSize='inherit' />
								<Typography fontSize={'var(--ft-body)'}>Выйти</Typography>
							</div>
							<div onClick={() => toggleShow(!isOpen)} style={{
								width: '100%',
								alignItems: 'center',
								display: 'flex',
								flexDirection: 'column',
							}}>
								<KeyboardReturnIcon fontSize='inherit' />
								<Typography fontSize={'var(--ft-body)'}>Вернуться</Typography>
							</div>
						</div >
						: null
					}
					<FileUploadNotification
					/>
				</div >
			</>
		)
	}

	if (isMobile) {
		return (
			<Modal
				isFullWidth={true}
				isOpen={isOpen}
				closeModal={() => toggleShow(false)}
				isFullscreen={true}
				className={''}
			>
				{renderSidebar()}
			</Modal>
		)
	}

	return (
		<Drawer
			width={width}
			isPermanent={!isMobile}
			open={isOpen}
			toggleDrawer={toggleShow}
		>
			{renderSidebar()}
		</Drawer>
	);
};
