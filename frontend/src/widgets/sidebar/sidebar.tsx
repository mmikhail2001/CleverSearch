import { DiskType, diskImgSrc } from '@models/disk';
import { switchToProcessed, switchToShared, switchToShow } from '@store/whatToShow';
import { TextWithImg } from '@feature/textWithImg/textWithimg';
import React, { FC, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import './sidebar.scss';
import { ButtonWithInput } from '@feature/buttonWithInput/buttonWithInput';
import { usePushFileMutation } from '@api/filesApi';
import { useAppSelector } from '@store/store';
import { changeDir, changeDisk } from '@store/currentDirectoryAndDisk';
import { diskTypes, isDiskType } from '@models/searchParams';
import { useSearchMutation, useShowMutation } from '@api/searchApi';
import RobotSVG from '@icons/Robot.svg';
import DownloadSVG from '@icons/Download.svg';
import CleverSVG from '@icons/disks/Disk.svg';
import { useNavigate } from 'react-router-dom';
import { transfromToShowRequestString } from '@api/transforms';
import { debounce } from '@helpers/debounce'
import { FolderCreation } from './folderCreation/folderCreation'
import { Drawer } from '@entities/drawer/drawer';
import { Modal } from '@feature/modal/modal';
import { UserProfile } from '@widgets/userProfile/userProfile';
import LogoutIcon from '@mui/icons-material/Logout';
import { Typography } from '@mui/material';
import { useLogout } from '@helpers/hooks/logout';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';

const getTextWithImg = (
	selected: boolean,
	disk: DiskType,
	text: string,
	setState: (text: diskTypes) => void,
) => {
	const { src, altText } = disk;

	return (
		<TextWithImg
			key={text + src}
			className={selected ? 'selected' : ''}
			text={text}
			imgSrc={src}
			altImgText={altText}
			onClick={() => {
				if (isDiskType(text)) {
					setState(text as diskTypes);
				}
			}}
		/>
	);
};

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
	const [selectedField, setSelectedField] = useState(
		Array.from(diskImgSrc.keys())[4]
	);

	const { isSearch, isShow, isProccessed, isShared } = useAppSelector((state) => state.whatToShow);
	const { dirs, currentDisk } = useAppSelector((state) => state.currentDirDisk);
	const dispatch = useDispatch();
	const [search] = useSearchMutation({ fixedCacheKey: 'search' });
	const [show] = useShowMutation({ fixedCacheKey: 'show' });

	const navigate = useNavigate()

	const allDisks = Array.from(diskImgSrc.keys()).map((key) =>
		getTextWithImg(
			selectedField === key && isShow,
			diskImgSrc.get(key)!,
			key,
			(text) => {
				setSelectedField(text);
				if (!isShow) {
					dispatch(switchToShow());
					const url = transfromToShowRequestString({ limit: 10, offset: 0, disk: text })
					navigate(url)
				}

				dispatch(changeDisk(text));
			}
		)
	);

	const params = useAppSelector((state) => state.searchRequest);

	useEffect(() => {
		if (isShow) {
			dispatch(changeDir({ dirs: [] }));
			show({ limit: 10, offset: 0, disk: currentDisk, dir: dirs });
		}
	}, [currentDisk]);

	const [send] = usePushFileMutation();
	const { email } = useAppSelector(state => state.userAuth)
	const logout = useLogout()

	const renderSidebar = (): React.ReactNode => {
		return (
			<>
				<div className="sidebar" style={{ width: '100%' }}>
					<div className="our-name-place">
						{isMobile ?
							<UserProfile email={email} isDropdownExist={false} />
							:
							<TextWithImg
								onClick={() => dispatch(switchToShow())}
								text="CleverSearch"
								className="our-name"
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
									search(params);
								} else if (isShow) {
									show({ limit: 10, offset: 0, disk: currentDisk, dir: dirs });
								}
							}, 300);
							Array.from(files).forEach((file) => {
								const formData = new FormData();

								formData.append('file', file, file.name);
								formData.append('dir', ['', ...dirs].join('/'));
								send(formData);
								debouncFunc();
							});
						}}
						disabled={false}
						variant={'contained'}
					></ButtonWithInput>
					<FolderCreation
						dirs={dirs}
						onFolderCreation={() => {
							if (isSearch) {
								search(params);
							} else {
								show({ limit: 10, offset: 0, disk: currentDisk, dir: dirs });
							}
						}}
					/>
					<div className="disk-show">
						<h2 className="disk-show-label">Ваши диски</h2>
						<div className="disks">{allDisks}</div>
					</div>
					<div className="under-disks">
						<TextWithImg
							text="Обрабатываются"
							className={['text-with-img', 'work-in-progress', isProccessed ? 'selected' : ''].join(' ')}
							imgSrc={RobotSVG}
							altImgText="Робот"
							onClick={() => {
								dispatch(switchToProcessed());
								dispatch(changeDisk('all'))
								navigate('/processed')
							}}
						/>
						<TextWithImg
							text="Общие"
							className={['shared', isShared ? 'selected' : ''].join(' ')}
							imgSrc={DownloadSVG} // TODO
							altImgText="Картинка с двумя людьми"
							onClick={() => {
								dispatch(switchToShared())
								dispatch(changeDisk('all'))
								navigate('/shared')
							}}
						/>
					</div>
					{isMobile
						? <div style={{
							display: "flex",
							justifyContent: 'space-between',
							marginTop: 'auto',
							width: '100%',
							fontSize: '2.4rem',
						}}>
							<div onClick={logout} style={{
								width: '100%',
								alignItems: 'center',
								display: "flex",
								flexDirection: 'column',
							}}>
								<LogoutIcon fontSize='inherit' />
								<Typography variant='h5'>Выйти</Typography>
							</div>
							<div onClick={() => toggleShow(!isOpen)} style={{
								width: '100%',
								alignItems: 'center',
								display: "flex",
								flexDirection: 'column',
							}}>
								<KeyboardReturnIcon fontSize='inherit' />
								<Typography variant='h5'>Вернуться</Typography>
							</div>
						</div >
						: null}

				</div >
			</>
		)
	}

	if (isMobile) {
		return (
			<Modal
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
