import { useLoginMutation } from '@api/userApi';
import { login as loginAction } from '@store/userAuth';
import { Button } from '@entities/button/button';
import { Input } from '@entities/input/input';
import { FC, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import './login.scss';
import React from 'react';
import { Typography } from '@mui/material';
import { notificationBar } from '@helpers/notificationBar';
import { ShowInfoButton } from '@feature/showInfoButton/showInfoButton';
import { useMobile } from 'src/mobileProvider';

interface LoginFormProps { }

export const LoginForm: FC<LoginFormProps> = () => {
	const [loginField, setLogin] = useState('');
	const [passwordField, setPassword] = useState('');

	const location = useLocation();

	const [error, setError] = useState('')

	const [login, loginResp] = useLoginMutation();
	const dispatch = useDispatch();

	const navigate = useNavigate();

	const {whatDisplay} = useMobile()

	if (loginResp.isSuccess) {
		dispatch(loginAction());
		if (location.key === 'default') {
			navigate('/');
		} else {
			const fromUrl = location.state.from
			navigate(fromUrl.pathname+fromUrl.search)
		}
	}
	
	useEffect(() => {
		if (loginResp.isError 
			&& 'status' in loginResp.error
			&& loginResp.error.status === 500
		) {
			setError('Wrong password or login')
			return
		}

		if (loginResp.isError 
			&& 'data' in loginResp.error
			&& typeof loginResp.error.data === 'object'
			&& 'message' in loginResp.error.data
			&& typeof loginResp.error.data.message === 'string'
			&& loginResp.error.data.message === 'wrong credentials'
		) {
			setError('User not exist')
		}

	},  [loginResp])

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

	const renderLoginForm = () => {
		return (
			<div className="login-form">
				<div className="login-form__main">
					<Typography className='login-form__name'>Authorization</Typography>
					<div className='login-form__inputs'>
						<Input
							isFullWidth={true}
							specificPaddingInside='small-padding'
							size='medium'
							border="none"
							specificRadius='small-radius'
							fontSize='var(--ft-paragraph)'
							disabled={loginResp.isLoading}
							type="email"
							placeholder="email"
							value={loginField}
							onChange={(e) => setLogin(e.target.value)}
						></Input>
						<Input
							isFullWidth={true}
							specificPaddingInside='small-padding'
							disabled={loginResp.isLoading}
							size='medium'
							border="none"
							type="password"
							fontSize='var(--ft-paragraph)'
							specificRadius='small-radius'
							placeholder="password"
							value={passwordField}
							onChange={(e) => setPassword(e.target.value)}
						></Input>
					</div>
				</div>
				<div className='login-form__buttons'>
					<Button
						style={{color: 'inherit'}}
						variant={'contained'}
						buttonText="Login"
						clickHandler={
							() => {
								login({ email: loginField, password: passwordField });
							}
						}
						isFullSize={true}
						disabled={!(loginField !== "" && passwordField !== "") || loginResp.isLoading}
					/>
					<Button
						variant={'text'}
						style={{justifyContent: 'center', color: 'inherit', opacity: '0.8'}}
						buttonText="Sign up"
						isFullSize={true}
						clickHandler={
							() => {
								navigate('/register', {replace: true, state: location.state})
							}
						}
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
			{renderBlock(renderLoginForm())}
		</div>
			
			<div></div>
			{whatDisplay === 1 ? null : <ShowInfoButton/>}
		</div>
	);
};
