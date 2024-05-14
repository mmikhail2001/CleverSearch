import { useGetInternalFilesMutation, useGetSharedFilesMutation, usePushFileMutation } from '@api/filesApi';
import { useSearchMutation } from '@api/searchApi';
import { TextWithInput } from '@feature/buttonWithInput/buttonWithInput';
import { TextWithImg } from '@feature/textWithImg/textWithimg';
import { diskImgSrc, diskTypes, isDiskType, isExternalDisk } from '@models/disk';
import { useAppSelector } from '@store/store';
import { switchDisk, switchToExternal, switchToLoved, switchToProcessed, switchToShared, switchToShow } from '@store/whatToShow';
import React, { FC, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import './sidebar.scss';

import { Button } from '@entities/button/button';
import { Drawer } from '@entities/drawer/drawer';
import { PopOver } from '@entities/popover/popover';
import { Modal } from '@feature/modal/modal';
import { debounce } from '@helpers/debounce';
import { useLogout } from '@helpers/hooks/logout';
import { ConnectedClouds } from '@models/user';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import LogoutIcon from '@mui/icons-material/Logout';
import { Typography } from '@mui/material';
import { newValues } from '@store/showRequest';
import { UserProfile } from '@widgets/userProfile/userProfile';
import { useNavigate } from 'react-router-dom';
import { DiskView } from './diskView/diskView';
import { FolderCreation } from './folderCreation/folderCreation';

import { getDriveURLFront, getInternalURLFront } from '@helpers/transformsToURL';
import AddIcon from '@mui/icons-material/Add';
import InsertDriveFileRoundedIcon from '@mui/icons-material/InsertDriveFileRounded';
import { isCorrectFormat } from '@helpers/isCorrectFormat';
import { BottomButtons } from './bottomButtons';
import { notificationBar } from '@helpers/notificationBar';
import { DiskConnect } from '@widgets/diskConnect/diskConnect';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

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
		isShared,
		whatDiskToShow,
		isExternal,
	} = useAppSelector((state) => state.whatToShow);

	const { isCanBeAdd } = useAppSelector(state => state.addPermission)

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

	const [aboutUsIsOpen, setAboutUsIsOpen] = useState(false)

	const refreshFiles = () => {
		if (isSearch) {
			search(param);
		} else if(isShow || isExternal) {
			show(showReq.dir.join('/'));
			dispatch(newValues({...showReq}))
		} else if (isShared) {
			showShared(showReq.dir.join('/'));
			dispatch(newValues({...showReq}))
		}
	}

	const goToInternal = (disk?: string) => {
		if (!isShow) {
			dispatch(switchToShow())
		}

		if (isDiskType(disk))dispatch(switchDisk(disk))

		const url = getInternalURLFront([])
		navigate(url)
		dispatch(newValues({...showReq,dir:[], disk: disk || 'internal'}))	
		
		return
	}

	useEffect(() =>{
		if (sendResp && sendResp.isSuccess && filesWasSend) {
			refreshFiles()
			setFilesWasSend(false)
		}
	}, [filesWasSend,sendResp])

	const diskToConnect = ():React.ReactNode | null => {
		return Array.from(diskImgSrc)
		.filter(val => val[1].diskName !== 'internal'
			&& val[1].diskName !== 'own')
		.map((val) => {
			if (isExternalDisk(val[1])) {
				return <DiskConnect classname='show-add-line' disk={val[1]} />
			}
			return null
		})
	}

	const renderSidebar = (): React.ReactNode => {
		return (
			<>
				<div 
					className="sidebar"
					style={{ width: width }}
				>
					<div className="our-name-place">
						{isMobile ?
							<UserProfile email={email} isDropdownExist={false} />
							:
							<Typography
								style={{cursor: 'pointer'}}
								onClick={() => goToInternal()}
								className={['our-name'].join(' ')}
							>
								CleverSearch
							</Typography>
						}
					</div>
					<div className='button_sidebar'>
						<PopOver
							background={'var(--color-selected)'}
							styleMain={{width: '179px'}}
							mainElement={
								<Button
									disabled={!isCanBeAdd}
									endIcon={<AddIcon fontSize='inherit'/>}
									isFullSize={true}
									fontSize={'var(--ft-paragraph)'}
									buttonText={'Add'} 
									clickHandler={() => {
										setCreationPopOpen(!isCreationPopOpen)} 
									} 
									variant={'contained'}								 
								/>
							}
							open={isCreationPopOpen}
							toggleOpen={(state) => {
								if (!isCanBeAdd) return
								setCreationPopOpen(state)
							}}
							isCloseOnSelect={false}
							variants='center'
						>
							{[
								<TextWithInput
									startIcon={<InsertDriveFileRoundedIcon fontSize='inherit' sx={{color: "#0A9542", marginBottom: '3px'}}/>}
									textStyles={{fontSize:'var(--ft-paragraph)'}}
									stylesOnRoot={{
										width: '185px', 
										paddingLeft:'1.5rem', 
										paddingTop: '1rem',
										paddingBottom: '0.5rem',
										fontSize: 'var(--ft-paragraph)',
										display: 'grid',
												gridTemplateColumns: "minmax(0, 0.5fr) minmax(0, 3fr) minmax(0, 0.25fr)",
										alignItems:'center',
									}}
									buttonText="File"
									onChange={(files: FileList) => {
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
										setCreationPopOpen(false)
									}}
									disabled={false}
								></TextWithInput>,
								<FolderCreation
									onClose={() => setCreationPopOpen(false)}
									dirs={showReq.dir}
									onFolderCreation={() => {
										refreshFiles()
										setCreationPopOpen(false)
									}}
								/>,
								diskToConnect()
							]}
						</PopOver>
					</div>
					<div className='disk-show'>
						<DiskView
							needSelect={isShow || isExternal}
							externalView={isExternal}
							setSelectedState={(disk: diskTypes | ConnectedClouds
							) => {
								if (typeof disk === 'string') {
									goToInternal(disk)
									return
								}
								
								if (!isExternal) {
									dispatch(switchToExternal())
								}

								dispatch(switchDisk(disk))

								const email = disks.clouds.find((val) => val.disk === disk.disk).cloud_email
								const url = getDriveURLFront([], email)
								navigate(url)
								dispatch(newValues({...showReq,dir:[], disk: disk}))
							}}
							nameOfSelectedDisk={typeof whatDiskToShow === 'string' ? whatDiskToShow : whatDiskToShow.disk}
						/>
						<BottomButtons/>
					</div>
					<Modal
						styleOnModal={{
							backgroundColor: 'var(--color-dropdowns)',
							color: 'inherit'
						}}
						isOpen={aboutUsIsOpen} 
						closeModal={() => setAboutUsIsOpen(false)} 
					>
						<Typography>Something</Typography>
					</Modal>
					<div style={{
						width: '100%', 
						marginTop: 'auto', 
						opacity: '0.6',
						cursor: 'pointer'
					}}>
						<TextWithImg 
							onClick={() =>setAboutUsIsOpen(true) } 
							text={'About us'} 
							imgSrc={<InfoOutlinedIcon fontSize='inherit'></InfoOutlinedIcon>} 
							altImgText={''} 
							className={'text-with-img-row text-with-img'}
						/>
					</div>
					{isMobile
						? <div style={{
							display: 'flex',
							justifyContent: 'space-between',
							marginTop: 'auto',
							width: '100%',
							fontSize: '2.4rem',
						}}
						>
							<Button 
								buttonText={'Logout'}
								clickHandler={logout} 
								variant={'contained'}
							></Button>
							<Button 
								buttonText={'Back to main'}
								clickHandler={() => toggleShow(!isOpen)} 
								variant={'contained'}
							></Button>
						</div >
						: null
					}
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
				stylesOnContentBackground={{
					background: 'linear-gradient(to bottom, #11344E, #700F49)',
				}} 
				styleOnModal={{color:"inherit"}}
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
