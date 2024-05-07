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
