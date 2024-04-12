import { diskImgSrc, diskTypes } from '@models/disk';
import { switchToProcessed, switchToShared, switchToShow } from '@store/whatToShow';
import { TextWithImg } from '@feature/textWithImg/textWithimg';
import React, { FC, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import './sidebar.scss';
import { ButtonWithInput } from '@feature/buttonWithInput/buttonWithInput';
import { usePushFileMutation } from '@api/filesApi';
import { useAppSelector } from '@store/store';
import { useSearchMutation, useShowMutation } from '@api/searchApi';
import RobotSVG from '@icons/Robot.svg';
import DownloadSVG from '@icons/Download.svg';
import CleverSVG from '@icons/disks/Disk.svg';
import { useNavigate } from 'react-router-dom';
import { debounce } from '@helpers/debounce'
import { FolderCreation } from './folderCreation/folderCreation'
import { Drawer } from '@entities/drawer/drawer';
import { Modal } from '@feature/modal/modal';
import { UserProfile } from '@widgets/userProfile/userProfile';
import LogoutIcon from '@mui/icons-material/Logout';
import { Typography } from '@mui/material';
import { useLogout } from '@helpers/hooks/logout';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import { DiskView } from './diskView/diskView'
import { ConnectedClouds } from '@models/user';
import { transfromToShowRequestString } from '@api/transforms';
import { changeDir, newValues } from '@store/showRequest';
import {FileUploadNotification} from '@feature/fileUploadNotification/fileUploadNotification'

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
	const { isSearch, isShow, isProccessed, isShared } = useAppSelector((state) => state.whatToShow);

	const dispatch = useDispatch();
	const navigate = useNavigate()

	const [search] = useSearchMutation({ fixedCacheKey: 'search' });
	const [show] = useShowMutation({ fixedCacheKey: 'show' });
	const showParam = useAppSelector(state => state.showRequest)
	const showReq = useAppSelector(state => state.showRequest)

	const param = useAppSelector((state) => state.searchRequest);

	const [send] = usePushFileMutation();
	const { email } = useAppSelector(state => state.userAuth)
	const logout = useLogout()

	let nameOfDisk: diskTypes;
	if (typeof showReq.disk === 'string') {
		nameOfDisk = showReq.disk
	} else {
		nameOfDisk = showReq.disk.disk
	}

	const renderSidebar = (): React.ReactNode => {
		return (
			<>
				<div className="sidebar" style={{ width: width }}>
					<div className="our-name-place">
						{isMobile ?
							<UserProfile email={email} isDropdownExist={false} />
							:
							<TextWithImg
								onClick={() => dispatch(switchToShow())}
								text="CleverSearch"
								className={['our-name', 'text-with-img-row'].join(' ')}
								imgSrc={CleverSVG}
								altImgText="our-logo"
							/>
						}
					</div>
					<ButtonWithInput
						buttonText="Добавить"
						onChange={(files: FileList) => {
							const debouncFunc = debounce(() => {
								if (isSearch) {
									search(param);
								} else if (isShow) {
									show({...showParam, disk: showReq.disk, dir: showReq.dir });
									dispatch(newValues({...showParam, disk: showReq.disk, dir: showReq.dir}))
								}
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
						variant={'contained'}
					></ButtonWithInput>
					<FolderCreation
						dirs={showReq.dir}
						onFolderCreation={() => {
							if (isSearch) {
								search(param);
							} else {
								show({...showParam, disk: showReq.disk, dir: showReq.dir });
								dispatch(newValues({...showParam, disk: showReq.disk, dir: showReq.dir}))
							}
						}}
					/>
					<DiskView
						needSelect={isShow}
						setSelectedState={(disk: diskTypes | ConnectedClouds
						) => {
							let internal = false;
							let external = false;
							if (typeof disk === 'string') {
								internal = true
								external = false
							} else {
								internal = false
								external = true
							}

							if (!isShow) dispatch(switchToShow())
								const url = transfromToShowRequestString({
								dir: [],
								disk: disk,
								limit: 10,
								offset: 0,
								externalDiskRequired: external,
								internalDiskRequired: internal,
							})
							navigate(url)
							dispatch(newValues({...showReq,dir:[], disk: disk}))
						}}
						nameOfSelectedDisk={nameOfDisk}
					/>
					<div className="under-disks">
						<TextWithImg
							text="В обработке"
							className={['text-with-img', 'work-in-progress', 'not-done', isProccessed ? 'selected' : '', 'text-with-img-row'].join(' ')}
							imgSrc={RobotSVG}
							altImgText="Робот"
							onClick={() => {
								dispatch(switchToProcessed());
								dispatch(newValues({...showReq, disk: 'all'}))
								navigate('/processed')
							}}
						/>
						<TextWithImg
							text="Общие"
							className={['shared', isShared ? 'selected' : '', 'text-with-img-row'].join(' ')}
							imgSrc={DownloadSVG} // TODO
							altImgText="Картинка с двумя людьми"
							onClick={() => {
								dispatch(switchToShared())
								dispatch(newValues({...showReq, disk: 'all'}))
								navigate('/shared')
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
				children={renderSidebar()} className={''}
			/>
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
