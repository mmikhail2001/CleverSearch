import { DiskType, diskImgSrc, diskTypes, isDiskType } from '@models/disk';
import React, { FC, useEffect, useState } from 'react';
import { isNullOrUndefined } from '@helpers/isNullOrUndefined';
import { TextWithImg } from '@feature/textWithImg/textWithimg';
import { useDiskLinkConnectMutation } from '@api/diskApi';
import { useNavigate } from 'react-router-dom';
import { notificationBar } from '@helpers/notificationBar';

import './settings.scss'
import { useSetAvatarMutation } from '@api/userApi';
import { TextWithInput } from '@feature/buttonWithInput/buttonWithInput';
import { Button } from '@entities/button/button';

const getTextWithImg = (
	selected: boolean,
	disk: DiskType,
	setState: (text: diskTypes) => void,
) => {
	if (isNullOrUndefined(disk)) return null
	const { src, altText, diskName } = disk;

	return (
		<div className='settings__disk'>
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
		</div>
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

	useEffect(() => {
		if(respAvatar.isSuccess) {
			notificationBar({
				children: "Successful set",
				variant: "success"
			})
			if (respAvatar.isError) {
				notificationBar({
					children: "Get error on set",
					variant: "error"
				})
			}
		} 
	}, [respAvatar])

	return <div className="settings-background">
		<div className='settings'>
			<div className='disk-show disks disk-connect-settings'>
				<p 
					className='settings__paragraph-name'
				>
					Connect external disks
				</p>
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
			<div className='disk-connect-settings'>
				<p 
					className='settings__paragraph-name'
				>
					Change profile
				</p>
				<TextWithInput
					accept='image/jpeg, image/png'
					textStyles={{
						fontSize: 'var(--ft-paragraph)',
						paddingLeft: 'var(--big-padding)',
						paddingRight: 'var(--big-padding)',
						paddingTop: 'var(--small-padding)',
						paddingBottom: 'var(--small-padding)',
					}}
					stylesOnRoot={{
						width: '100%',
					}}
					buttonText='Change profile'
					onChange={(files) => {
						Array.from(files).forEach((file) => {
							const formData = new FormData();

							formData.append('avatar', file, file.name);
							sentAvatar(formData);
						});
					}}
					disabled={false}
				/>
			</div>
			<div style={{
				display: 'flex',
				justifyContent: 'space-between',
				height: '47px',
				width: '70%',
			}}>
				<Button
					style={{padding: "1rem"}}
					isFullSize={true} 
					buttonText={'Back to main'} 
					clickHandler={() => navigate('/')} 
					variant={'contained'}
				/>
			</div >
		</div>
		<div></div>
	</div >
};
