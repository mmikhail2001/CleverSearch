import { useLazyProfileQuery, useProfileQuery } from '@api/userApi';
import { isDiskType } from '@models/disk';
import { isConnectedClouds } from '@models/user';
import { LoadingPage } from '@pages/loadingPage/loadingPage';
import { SerializedError } from '@reduxjs/toolkit';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { useAppSelector } from '@store/store';
import { login as loginAction, logout as logoutAction, setUserEmail } from '@store/userAuth';
import { addDisk } from '@store/userDisks';
import React, { FC, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Navigate, useLocation } from 'react-router';
import { useNavigate } from 'react-router-dom';

export interface AuthContextType {
	state: boolean,
	isLoading: boolean,
}

const AuthContext = React.createContext<AuthContextType>(null!);

export interface AuthReturns {
	error?: FetchBaseQueryError | SerializedError,
	data?: undefined,
	isLoading?: boolean,
	isError?: boolean
}

export const AuthProvider: FC<{ children: React.ReactNode }> = ({ children }) => {
	const dispatch = useDispatch();
	const [passedContext, setPassedContext] = useState({
		isLoading: true,
		state: false,
	} as AuthContextType)

	const {isAuthenticated} = useAppSelector(state => state.userAuth)
	const [getProfile, resp] = useLazyProfileQuery()

	useEffect(() => {
		getProfile(null)
	}, [isAuthenticated])

	useEffect(() => {
		if (resp.isLoading || resp.isFetching) {
			setPassedContext({
				state: false,
				isLoading: true,
			})
		} else {
			if (resp.isError) {
				dispatch(logoutAction());
				
				setPassedContext({
					state: false,
					isLoading: false,
				})
			}
	
			if (resp.isSuccess) {
				if (resp.data.connected_clouds) {
					resp.data.connected_clouds.forEach(element => {
						dispatch(addDisk(element))
					});
				}
				dispatch(setUserEmail({ email: resp.data.email }))
				dispatch(loginAction());
				
				setPassedContext({
					state: true,
					isLoading: false,
				})
			}

			if (!resp.isError && !resp.isSuccess && !resp.isUninitialized) {
				setPassedContext({
					state: false,
					isLoading: false,
				})
			}
		}
	}, [resp])

	return <AuthContext.Provider value={passedContext}>{children}</AuthContext.Provider>;
};

export const ProtectedFromAuthUser: FC<{ children: React.ReactNode }> = ({ children }) => {
	const authState = useAuth()
	const location = useLocation();

	const navigate = useNavigate()

	const [elementToReturn, setElementToReturn] = useState<React.ReactNode>(null)

	useEffect(() => {
		if (authState.isLoading) {
			setElementToReturn(<LoadingPage />)
		} else {
			if (authState.state) {
				navigate('/', {state: { from: location, replace: true }})
			}

			setElementToReturn(children)
		}
	}, [authState,children])
	
	return elementToReturn;
};

export const RequireAuth: FC<{ children: React.ReactNode }> = ({ children }) => {
	const location = useLocation();
	const authState = useAuth()
	const navigate = useNavigate()
	
	const [elementToReturn, setElementToReturn] = useState<React.ReactNode>(null)

	useEffect(() => {
		if (authState.isLoading) {
			setElementToReturn(<LoadingPage></LoadingPage>)
		} else {
			if (!authState.state) {
				navigate('/login', {state: {'from': location}})
			}
			setElementToReturn(children)
		}
	}, [authState, children])

	return elementToReturn;
};

export function useAuth(): AuthContextType {
	return React.useContext(AuthContext);
}
