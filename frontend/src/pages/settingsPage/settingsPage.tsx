import { DiskType, diskImgSrc, diskTypes, isDiskType } from '@models/disk';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import { Typography } from '@mui/material';
import React, { FC, useEffect, useState } from 'react';
import { isNullOrUndefined } from '@helpers/isNullOrUndefined';
import { TextWithImg } from '@feature/textWithImg/textWithimg';
import { useDiskLinkConnectMutation } from '@api/diskApi';
import { useNavigate } from 'react-router-dom';

import './settings.scss'
import { useSetAvatarMutation } from '@api/userApi';
import { Input } from '@entities/input/input';
import { ButtonWithInput } from '@feature/buttonWithInput/buttonWithInput';

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
	const [diskToConnect, setDiskToConnect] = useState<diskTypes>('internal')

	const [sentAvatar, respAvatar] = useSetAvatarMutation()

	const navigate = useNavigate()

	useEffect(() => {
		if (diskToConnect !== 'internal' && !resp.isLoading) {
			window.location.href = resp.data.redirect;
		}
	}, [resp])

	return <div className="settings">
		<div className='disk-show disks disk-connect-settings'>
			<Typography fontWeight={600} fontSize={'var(--ft-paragraph)'}>
				Connect
			</Typography>
			{
				Array.from(diskImgSrc)
					.filter(val => val[1].diskName !== 'internal'
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
		<div>
			<ButtonWithInput
				buttonText='Set avatar'
				onChange={(files) => {
					Array.from(files).forEach((file) => {
						const formData = new FormData();

						formData.append('avatar', file, file.name);
						sentAvatar(formData);
					});
				}}
				variant='contained'
				disabled={false}
			/>
			{respAvatar.isSuccess ? <p>Аватар установлен</p> : null}
			{respAvatar.isError ? <p>Произошла ошибка при установке</p> : null}
		</div>
		<div style={{
			display: 'flex',
			justifyContent: 'space-between',
			width: '300px',
			fontSize: '2.4rem',
		}}>
			<div onClick={() => navigate('/')} style={{
				width: '100%',
				alignItems: 'center',
				display: 'flex',
				flexDirection: 'column',
				cursor: 'pointer'
			}}>
				<KeyboardReturnIcon fontSize='inherit' />
				<Typography fontSize={'var(--ft-body)'}>Back to main</Typography>
			</div>
		</div >
		
	</div >
};
