import { useProfileQuery } from '@api/userApi';
import { SerializedError } from '@reduxjs/toolkit';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { useAppSelector } from '@store/store';
import { login as loginAction, logout as logoutAction } from '@store/userAuth';
import React, { FC } from 'react';
import { useDispatch } from 'react-redux';
import { Navigate, useLocation } from 'react-router';

export interface AuthContextType {
	state: boolean,
}

export const RequireAuth: FC<{ children: React.ReactNode }> = ({ children }) => {
	const auth = useAppSelector(state => state.userAuth.isAuthenticated);
	const location = useLocation();

	if (!auth) {
		return <Navigate to="/login" state={{ from: location }} replace />;
	}

	return children;
};

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

	const { isError } = useProfileQuery('');

	if (isError) {
		authState = false;
		dispatch(logoutAction());
	} else {
		authState = true;
		dispatch(loginAction());
	}

	const passedContext = {
		state: authState,
	} as AuthContextType;

	return <AuthContext.Provider value={passedContext}>{children}</AuthContext.Provider>;
};

export const ProtectedFromAuthUser: FC<{ children: React.ReactNode }> = ({ children }) => {
	const auth = useAppSelector(state => state.userAuth.isAuthenticated);
	const location = useLocation();

	if (auth) {
		return <Navigate to="/" state={{ from: location }} replace />;
	}

	return children;
};

export function useAuth(): AuthContextType {
	return React.useContext(AuthContext);
}