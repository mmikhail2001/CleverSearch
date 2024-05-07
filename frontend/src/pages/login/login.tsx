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
				<div className="login-form__main">
					<Typography className='login-form__name'>Authorization</Typography>
					<div className='login-form__inputs'>
						<Input
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
						variant={'contained'}
						buttonText="To Register page"
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
