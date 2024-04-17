import { useProfileQuery } from '@api/userApi';
import { LoadingPage } from '@pages/loadingPage/loadingPage';
import { SerializedError } from '@reduxjs/toolkit';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { useAppSelector } from '@store/store';
import { login as loginAction, logout as logoutAction, setUserEmail } from '@store/userAuth';
import { addDisk } from '@store/userDisks';
import React, { FC } from 'react';
import { useDispatch } from 'react-redux';
import { Navigate, useLocation } from 'react-router';

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
	let authState = false;
	const dispatch = useDispatch();

	const { isError, isSuccess, isLoading, data } = useProfileQuery(null);

	if (isError) {
		authState = false;
		dispatch(logoutAction());
	} else {
		if (isSuccess) {
			// setTimeout(() => {
				authState = true;
				if (data.connected_clouds) {
					data.connected_clouds.forEach(element => {
						dispatch(addDisk(element))
					});
				}
				dispatch(setUserEmail({ email: data.email }))
				dispatch(loginAction());
			// }, 0)
		}
	}

	const passedContext = {
		state: authState,
		isLoading: isLoading,
	} as AuthContextType;

	return <AuthContext.Provider value={passedContext}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextType {
	return React.useContext(AuthContext);
}


export const ProtectedFromAuthUser: FC<{ children: React.ReactNode }> = ({ children }) => {
	const authState = useAuth()
	const auth = useAppSelector(state => state.userAuth.isAuthenticated);
	const location = useLocation();

	if (authState.isLoading) return <LoadingPage />
	if (auth) {
		return <Navigate to="/" state={{ from: location }} replace />;
	}

	return children;
};

export const RequireAuth: FC<{ children: React.ReactNode }> = ({ children }) => {
	const auth = useAppSelector(state => state.userAuth.isAuthenticated);
	const location = useLocation();
	const authState = useAuth()

	if (authState.isLoading) return <LoadingPage />

	if (!auth) {
		return <Navigate to="/login" state={{ from: location }} replace />;
	}

	return children;
};

