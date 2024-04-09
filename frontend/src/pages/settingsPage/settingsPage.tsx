import { Modal } from '@feature/modal/modal';
import { DiskType, diskImgSrc, diskTypes, isDiskType } from '@models/disk';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import LogoutIcon from '@mui/icons-material/Logout';
import { Typography } from '@mui/material';
import React, { FC, useEffect, useState } from 'react';
import { useMobile } from 'src/mobileProvider';
import { isNullOrUndefined } from '@helpers/isNullOrUndefined';
import { TextWithImg } from '@feature/textWithImg/textWithimg';
import { useDiskLinkConnectMutation } from '@api/diskApi';
import { useNavigate } from 'react-router-dom';
import { useLogout } from '@helpers/hooks/logout';

import './settings.scss'

// TODO maybe another file?
const getTextWithImg = (
	selected: boolean,
	disk: DiskType,
	setState: (text: diskTypes) => void,
) => {
	if (isNullOrUndefined(disk)) return null
	const { src, altText, diskName } = disk;

	return (
		<TextWithImg
			key={diskName + src}
			className={['text-with-img-row'].join(' ')}
			text={diskName}
			imgSrc={src}
			altImgText={altText}
			onClick={() => {
				if (isDiskType(diskName)) {
					setState(diskName as diskTypes);
				}
			}}
		/>
	);
};

export const SettingsPage: FC = () => {
	const [connect, resp] = useDiskLinkConnectMutation()
	const [diskToConnect, setDiskToConnect] = useState<diskTypes>('all')
	const [isOpenModal, setOpenModal] = useState<boolean>(false)

	const navigate = useNavigate()

	useEffect(() => {
		console.log(diskToConnect, resp)
		if (diskToConnect !== 'all' && !resp.isLoading) {
			setOpenModal(true)
		}
	}, [resp])

	console.log(resp)
	return <div className="settings">
		<div className='disk-show disks disk-connect-settings'>
			<Typography fontWeight={600} fontSize={'var(--ft-paragraph)'}>
				Подключить
			</Typography>
			{
				// TODO make link to get url
				// Maybe open modal with link copied
				Array.from(diskImgSrc)
					.filter(val => val[1].diskName !== 'all'
						&& val[1].diskName !== 'own')
					.map(val => {
						return getTextWithImg(
							false,
							val[1],
							(text: diskTypes) => {
								connect(text)
								setDiskToConnect(text)
							}
						)
					})
			}
		</div>
		<div style={{
			display: "flex",
			justifyContent: 'space-between',
			width: '300px',
			fontSize: '2.4rem',
		}}>
			<div onClick={() => navigate('/')} style={{
				width: '100%',
				alignItems: 'center',
				display: "flex",
				flexDirection: 'column',
				cursor: 'pointer'
			}}>
				<KeyboardReturnIcon fontSize='inherit' />
				<Typography fontSize={'var(--ft-body)'}>Вернуться</Typography>
			</div>
		</div >

		<Modal
			children={
				<div style={{
					display: 'flex',
					gap: 'var(--big-padding)',
					flexDirection: 'column',
				}}>
					<Typography
						fontSize={'var(--ft-body)'}
						style={{
							display: 'flex',
							flexDirection: 'row',
							gap: 'var(--normal-padding)',
						}}
					>
						<Typography
							fontSize={'inherit'}
							fontWeight={600}
						>Диск:
						</Typography>
						{diskToConnect}
					</Typography>
					{resp.isError ?
						<Typography
							fontSize={'var(--ft-body)'}
						>
							Произошла ошибка
						</Typography>
						: <Typography
							fontSize={'var(--ft-body)'}
						>
							{JSON.stringify(resp.data)}
						</Typography>
					}
				</div>
			}
			closeModal={() => setOpenModal(false)}
			isOpen={isOpenModal}
		/>
	</div >
};
