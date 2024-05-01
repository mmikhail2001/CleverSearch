import { useLoginMutation } from '@api/userApi';
import { login as loginAction } from '@store/userAuth';
import { Button } from '@entities/button/button';
import { Input } from '@entities/input/input';
import { FC, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import './login.scss';
import React from 'react';
import { Typography } from '@mui/material';

interface LoginFormProps { }

export const LoginForm: FC<LoginFormProps> = () => {
	const [loginField, setLogin] = useState('');
	const [passwordField, setPassword] = useState('');

	const [login, loginResp] = useLoginMutation();
	const dispatch = useDispatch();

	const navigate = useNavigate();

	if (loginResp.isSuccess) {
		dispatch(loginAction());
		navigate('/');
	}

	return (
		<div className='login-background'>
			<div className="login-form">
				<div className="login-form__inputs">
					<Typography className='register-form__name'>Authorization:</Typography>
					<Input
							size='medium'
							border="none"
							style={{
									padding: 'var(--big-padding)',
									border: 'none !important',
								"& .Mui-focused": {
									border: '1px solid rgba(255,255,255,1)',
									outline:"none",
								},
								'& .MuiOutlinedInput-notchedOutline': {
									outline: 'none',
									borderColor: 'rgba(255,255,255,0.4) !important',
								},
								'& input[type=email]': {
									padding: '15px !important', 
								},
							}}
							fontSize='var(--ft-paragraph)'
							disabled={loginResp.isLoading}
							type="email"
							placeholder="email"
							value={loginField}
							onChange={(e) => setLogin(e.target.value)}
						></Input>
						<Input
							disabled={loginResp.isLoading}
							size='medium'
							border="none"
							type="password"
							fontSize='var(--ft-paragraph)'
							style={{
								padding: 'var(--big-padding)',
								border: 'none !important',
								"& .Mui-focused": {
									border: '1px solid rgba(255,255,255,1)',
									outline:"none",
								},
								'& .MuiOutlinedInput-notchedOutline': {
									outline: 'none',
									borderColor: 'rgba(255,255,255,0.4) !important',
								},
								'& input[type=password]': {
									padding: '15px !important', 
								},
							}}
							placeholder="password"
							value={passwordField}
							onChange={(e) => setPassword(e.target.value)}
						></Input>
				</div>
				<div className='login-form__buttons'>
					<Button
						variant={'contained'}
						buttonText="Lets go"
						clickHandler={
							() => {
								login({ email: loginField, password: passwordField });
							}
						}
						isFullSize={true}
						disabled={!(loginField !== "" && passwordField !== "") || loginResp.isLoading ? true : false}
					/>
					<Button
						variant={'contained'}
						buttonText="To Register"
						isFullSize={true}
						clickHandler={
							() => {
								navigate('/register')
							}
						}
					/>
				</div>
			</div>
		<div></div>
		</div>
	);
};
