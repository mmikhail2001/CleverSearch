import { useLoginMutation, useRegisterMutation } from '@api/userApi';
import { login as loginAction } from '@store/userAuth';
import { Button } from '@entities/button/button';
import { Input } from '@entities/input/input';
import React, { FC, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import './register.scss';
import { Typography } from '@mui/material';

interface RegisterProps { }

export const RegisterForm: FC<RegisterProps> = () => {
	const [loginField, setLogin] = useState('');
	const [passwordField, setPassword] = useState('');

	const [register, registerResp] = useRegisterMutation();
	const dispatch = useDispatch();

	const navigate = useNavigate();

	if (registerResp.isSuccess) {
		dispatch(loginAction());
		navigate('/');
	}

	return (
		<div className='register-background'>
			<div className="register-form">
				<div className="register-form__inputs">
					<Typography className='register-form__name'>Registration:</Typography>
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
						disabled={registerResp.isLoading}
						type="email"
						placeholder="email"
						value={loginField}
						onChange={(e) => setLogin(e.target.value)}
					></Input>
					<Input
						disabled={registerResp.isLoading}
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
				<div className='register-form__buttons'>
					<Button
						variant={'contained'}
						buttonText="Lets go"
						isFullSize={true}
						clickHandler={
							() => {
								register({ email: loginField, password: passwordField });
							}
						}
						disabled={!(loginField !== "" && passwordField !== "") 
							&& registerResp.isLoading ? true : false
						}
					/>
					<Button
						variant={'contained'}
						buttonText="To Login"
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
