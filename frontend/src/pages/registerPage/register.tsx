import { useLoginMutation, useRegisterMutation } from '@api/userApi';
import { login as loginAction } from '@store/userAuth';
import { Button } from '@entities/button/button';
import { Input } from '@entities/input/input';
import React, { FC, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import './register.scss';

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
		<div className="register-form">
			<div className="register-form__inputs">
				<p>Registration:</p>
				<Input
					disabled={registerResp.isLoading}
					type="email"
					placeholder="email"
					value={loginField}
					onChange={(e) => setLogin(e.target.value)}
				></Input>
				<Input
					disabled={registerResp.isLoading}
					type="password"
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
					buttonText="Login"
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
	);
};
