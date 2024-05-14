import { useLoginMutation, useRegisterMutation } from '@api/userApi';
import { login as loginAction } from '@store/userAuth';
import { Button } from '@entities/button/button';
import { Input } from '@entities/input/input';
import React, { FC, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import './register.scss';
import { Typography } from '@mui/material';
import { notificationBar } from '@helpers/notificationBar';
import { ShowInfoButton } from '@feature/showInfoButton/showInfoButton';
import { useMobile } from 'src/mobileProvider';

interface RegisterProps { }

interface credentials {
	email:string, 
	password: string
}

export const RegisterForm: FC<RegisterProps> = () => {
	const [loginField, setLogin] = useState('');
	const [passwordField, setPassword] = useState('');

	const [sendCredentials, setSendCredentials] = useState<credentials>({} as credentials)

	const {whatDisplay} = useMobile()
	const location = useLocation()

	const [login, loginResp] = useLoginMutation();
	const [register, registerResp] = useRegisterMutation();
	const [error, setError] = useState('')

	const dispatch = useDispatch();
	const navigate = useNavigate();

	if (loginResp.isError && registerResp.isSuccess) {
		dispatch(loginAction());
		navigate('/login', {replace: true, state: location.state});
	}

	if (loginResp.isSuccess) {
		dispatch(loginAction());
		
		if (loginResp.isSuccess) {
			dispatch(loginAction());
			console.log('location', location)
			if (location.key === 'default') {
				navigate('/');
			} else {
				const fromUrl = location.state.from
				console.log('location.state.from', location.state.from,fromUrl.pathname+fromUrl.search )
				navigate(fromUrl.pathname+fromUrl.search)
			}
		}
	}

	useEffect(() => {
		if (registerResp.isError 
			&& 'data' in registerResp.error
			&& typeof registerResp.error.data === 'object'
			&& 'message' in registerResp.error.data
			&& typeof registerResp.error.data.message === 'string'
		) {
			setError(registerResp.error.data.message)
		}
		
		if (registerResp.isSuccess) {
			login(sendCredentials)
		}
	}, [registerResp])

	useEffect(() => {
		if (error !== '') {
			notificationBar(
				{
					children: error,
					variant: "error",
				}
			)
			setError('')
		}
	}, [error])

	const renderBlock = (child: React.ReactNode) => {
		return <div
			style={{
				background:'rgba(0,0,0,0.1)',
				borderRadius: 'var(--big-radius)',
				display:'flex',
				justifyContent:'center',
			}}
		>
			{child}
		</div>
	}

	const renderRegisterForm = () => {
		return (
			<div className="register-form">
				<div className="register-form__main">
					<Typography className='register-form__name'>Registration</Typography>
					<div className='register-form__inputs'>
						<Input
							specificRadius='small-radius'
							size='medium'
							border="none"
							fontSize='var(--ft-paragraph)'
							disabled={registerResp.isLoading}
							type="email"
							placeholder="email"
							value={loginField}
							specificPaddingInside='small-padding'
							onChange={(e) => setLogin(e.target.value)}
						></Input>
						<Input
							specificRadius='small-radius'
							disabled={registerResp.isLoading}
							size='medium'
							border="none"
							type="password"
							fontSize='var(--ft-paragraph)'
							placeholder="password"
							specificPaddingInside='small-padding'
							value={passwordField}
							onChange={(e) => setPassword(e.target.value)}
						></Input>
					</div>
				</div>
				<div className='register-form__buttons'>
					<Button
						variant={'contained'}
						buttonText="Register"
						isFullSize={true}
						clickHandler={
							() => {
								register({ email: loginField, password: passwordField });
								setSendCredentials({ email: loginField, password: passwordField })
							}
						}
						disabled={!(loginField !== "" && passwordField !== "") 
							|| registerResp.isLoading
						}
					/>
					<Button
						variant={'text'}
						buttonText="Sign in"
						isFullSize={true}
						style={{justifyContent: 'center', color: 'inherit', opacity: '0.8'}}
						clickHandler={
							() => {
								navigate('/login', {replace: true, state: location.state})
							}
						}
						disabled={registerResp.isLoading ? true : false}
					/>
				</div>
			</div>
		)
	}

	const renderInfoBlock = () => {
		return (
			<div style={{
				display: 'flex', 
				flexDirection: 'column', 
				padding: '32px',
				alignItems: 'center',
				}}
			>
				<Typography fontSize={'var(--ft-title)'} style={{opacity: '0.8'}}>Info</Typography>
				<Typography fontSize={'var(--ft-paragraph)'} style={{opacity: '0.6'}}>CleverSearch is a web application designed to revolutionize data management and retrieval. Users can store their data securely, effortlessly share it with others, and seamlessly integrate external drives for expanded storage options. The standout feature of CleverSearch is its intelligent semantic search capability, allowing users to search for meaning across all their files. Whether it's documents, images, or any other file type, CleverSearch's advanced search functionality ensures users can quickly locate the information they need, regardless of where it's stored. With CleverSearch, managing and accessing your data has never been easier or more intuitive.</Typography>
			</div>
		)
	}

	const isPC = whatDisplay === 1
	return (
		<div className='login-background' style={{position: 'relative'}}>
			<div style={{
			position: 'absolute',
			top: '32px',
			left: '24px'
		}}>
			<Typography
				style={{cursor: 'default'}}
				className={['our-name'].join(' ')}
			>
				CleverSearch
			</Typography>
		</div>
		<div style={{
				marginTop: '92px',
				display: isPC ? 'grid' : 'flex',
				gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)',
				marginRight: isPC ?  '32px' : null,
    			marginLeft:  isPC ? '32px' : null,
				gap: '64px',
				maxWidth: 'min(100%, 1134px)'
			}}>
			{
				whatDisplay === 1 
				? renderBlock(renderInfoBlock())
				: null
			}
			{renderBlock(renderRegisterForm())}
		</div>
			
			<div></div>
			{whatDisplay === 1 ? null : <ShowInfoButton/>}
		</div>
	);
};
