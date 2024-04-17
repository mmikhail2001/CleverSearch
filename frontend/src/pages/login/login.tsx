import { useLoginMutation } from '@api/userApi';
import { login as loginAction } from '@store/userAuth';
import { Button } from '@entities/button/button';
import { Input } from '@entities/input/input';
import { FC, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import './login.scss';
import React from 'react';

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
		<div className="login-form">
			<div className="login-form__inputs">
				<Input
					disabled={loginResp.isLoading}
					type="email"
					placeholder="email"
					value={loginField}
					onChange={(e) => setLogin(e.target.value)}
				></Input>
				<Input
					disabled={loginResp.isLoading}
					type="password"
					placeholder="password"
					value={passwordField}
					onChange={(e) => setPassword(e.target.value)}
				></Input>
			</div>
			<Button
				variant={'contained'}
				buttonText="Lets go"
				clickHandler={
					() => {
						login({ email: loginField, password: passwordField });

					}
				}
				disabled={(loginField && passwordField) || loginResp.isLoading ? false : true}
			></Button>
		</div>
	);
};
