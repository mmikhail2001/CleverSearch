import { store } from '@store/store';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import App from './App';
import './index.scss';

import { LoginForm } from '@modules/login/login';

import { AuthProvider, RequireAuth, ProtectedFromAuthUser } from './authProvider';
import ErrorPage from '@modules/errorPage/errorPage';

// @ts-ignore
// TODO Not find any types of this 
import * as pdfjsLib from 'pdfjs-dist/webpack.mjs';

const root = ReactDOM.createRoot(
	document.getElementById('root') as HTMLElement
);

pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;

root.render(
	<React.StrictMode>
		<Provider store={store}>
			<BrowserRouter>
				<AuthProvider>
					<Routes>
						<Route path='/' errorElement={<ErrorPage />} element={<RequireAuth><App /></RequireAuth>}></Route>
						<Route path='/login' errorElement={<ErrorPage />} element={<ProtectedFromAuthUser><LoginForm /></ProtectedFromAuthUser>}></Route>
					</Routes>
				</AuthProvider>
			</BrowserRouter>
		</Provider>
	</React.StrictMode>
);