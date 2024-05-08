import {  diskImgSrc, isExternalDisk } from '@models/disk';
import React, { FC, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationBar } from '@helpers/notificationBar';

import './settings.scss'
import { useSetAvatarMutation } from '@api/userApi';
import { TextWithInput } from '@feature/buttonWithInput/buttonWithInput';
import { Button } from '@entities/button/button';
import { DiskConnect } from '@widgets/diskConnect/diskConnect';


export const SettingsPage: FC = () => {
	const [sentAvatar, respAvatar] = useSetAvatarMutation()

	const navigate = useNavigate()

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
						.map((val) => {
							if (isExternalDisk(val[1])) {
								return <DiskConnect disk={val[1]} />
							}
							return <></>
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
