import { useLoginMutation, useRegisterMutation } from '@api/userApi';
import { login as loginAction } from '@store/userAuth';
import { Button } from '@entities/button/button';
import { Input } from '@entities/input/input';
import React, { FC, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import './register.scss';
import { Typography } from '@mui/material';
import { notificationBar } from '@helpers/notificationBar';

interface RegisterProps { }

interface credentials {
	email:string, 
	password: string
}

export const RegisterForm: FC<RegisterProps> = () => {
	const [loginField, setLogin] = useState('');
	const [passwordField, setPassword] = useState('');

	const [sendCredentials, setSendCredentials] = useState<credentials>({} as credentials)

	const [login, loginResp] = useLoginMutation();
	const [register, registerResp] = useRegisterMutation();
	const [error, setError] = useState('')

	const dispatch = useDispatch();
	const navigate = useNavigate();

	if (loginResp.isError && registerResp.isSuccess) {
		dispatch(loginAction());
		navigate('/');
	}

	if (loginResp.isSuccess) {
		dispatch(loginAction());
		navigate('/');
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

	return (
		<div className='register-background'>
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
						variant={'contained'}
						buttonText="To Login page"
						isFullSize={true}
						clickHandler={
							() => {
								navigate('/login')
							}
						}
						disabled={registerResp.isLoading ? true : false}
					/>
				</div>
			</div>
			<div></div>
		</div>
	);
};
