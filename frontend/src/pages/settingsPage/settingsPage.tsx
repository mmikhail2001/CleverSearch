import {  diskImgSrc, diskTypes, isExternalDisk } from '@models/disk';
import React, { FC, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationBar } from '@helpers/notificationBar';

import './settings.scss'
import { getAvatarByEmail, useSetAvatarMutation } from '@api/userApi';
import { TextWithInput } from '@feature/buttonWithInput/buttonWithInput';
import { Button } from '@entities/button/button';
import { DiskConnect } from '@widgets/diskConnect/diskConnect';
import { Typography } from '@mui/material';
import { useDiskLinkConnectMutation } from '@api/diskApi';
import { useAppSelector } from '@store/store';


export const SettingsPage: FC = () => {
	const [sentAvatar, respAvatar] = useSetAvatarMutation()
	const {email} = useAppSelector(state=> state.userAuth)
	const [image, setImage] = useState<string>()

	const navigate = useNavigate()

	const googleDisk = diskImgSrc.get('google')

	const [connect, resp] = useDiskLinkConnectMutation()
	const [diskToConnect, setDiskToConnect] = useState<diskTypes>('internal')


	useEffect(() => {
		if (email !== '') {
			setImage(getAvatarByEmail(email))
		}
	}, [email])

	useEffect(() => {
		if(respAvatar.isSuccess) {
			notificationBar({
				children: "Successful set",
				variant: "success"
			})
			if (email !== '') {
				setImage(getAvatarByEmail(email))
			}
		}
		if (respAvatar.isError) {
			notificationBar({
				children: "Get error on set",
				variant: "error"
			})
		}
	}, [respAvatar])

	useEffect(() => {
		if (diskToConnect !== 'internal' && !resp.isLoading) {
			window.location.href = resp.data.redirect;
		}
	}, [resp])


	const renderBlockWithImg = (
		imgWithText: React.ReactNode, 
		titleText: string, 
	) => {
		return <div style={{
			gap: '22px',
			width: '100%',
			background: 'rgba(0,0,0,0.1)',
			borderRadius: 'var(--big-radius)',
			padding: '24px',
			display: 'flex',
			flexDirection: 'column',
			justifyContent: 'center',
			alignItems: 'center',
		}}>
			<Typography style={{opacity: '0.8'}} fontSize={'3.2rem'}>{titleText}</Typography>
			{imgWithText}
		</div>
	}

	return <div style={{position: 'relative'}} className="settings-background">
		<div style={{
			position: 'absolute',
			top: '32px',
			left: '24px'
		}}>
			<Typography
				style={{cursor: 'pointer'}}
				onClick={() => navigate('/')}
				className={['our-name'].join(' ')}
			>
				CleverSearch
			</Typography>
		</div>
		
		<div className='settings'>
			{
				renderBlockWithImg(
					<div
						onClick={() => {
							connect('google')
							setDiskToConnect('google')
						}} 
						style={{
							display: 'flex', 
							flexDirection: 'column', 
							gap: '16px', 
							alignItems: 'center',
							width: '100%',
							cursor: 'pointer',
						}}
					>
						<img src={googleDisk.src} style={{
							width: 'auto',
							height: '75px',
						}} /> 
						<Typography fontSize={'15px'}>Google drive</Typography>
					</div>,
					'Connect clouds', 
				)
			}

			{
				renderBlockWithImg(
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
							alignItems:'center',
							display: 'flex',
							flexDirection: 'column',
							gap: '16px',
							cursor: 'pointer',
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
						startIcon={
							<img src={image} style={{
								width: '100px',
								height: '100px',
								borderRadius: '50%',
							}}
							/>
						}
					/>,
					'Change profile'
				)
			}

			<div style={{
				display: 'flex',
				justifyContent: 'space-between',
				height: '47px',
				width: '70%',
			}}>
				<Button
					style={{
						padding: "1rem",
						color: 'inherit',
					}}
					isFullSize={true} 
					buttonText={'Back to main'} 
					clickHandler={() => navigate('/')} 
					variant={'text'}
				/>
			</div >
		</div>
		<div></div>
	</div >
};
