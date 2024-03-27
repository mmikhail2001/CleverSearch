import { store } from '@store/store';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './index.scss';

import { MainPage } from '@pages/mainPage/mainPage';
import { LoginForm } from '@pages/login/login';

import { AuthProvider, RequireAuth, ProtectedFromAuthUser } from './authProvider';
import ErrorPage from '@pages/errorPage/errorPage';

import { ShowShowedFiles } from '@widgets/showResults/showShowedFiles/showShowedFiles'
import { ShowSearchedFiles } from '@widgets/showResults/showSearchedFiles/showSearchedFiles'
import { ShowSharedFiles } from '@widgets/showResults/showSharedFiles/showSharedFiles'
import { ShowSharedUUIDFiles } from '@widgets/showResults/showSharedFiles/showSharedUUIDFiles'
import './App.scss'

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
						<Route path='/' errorElement={<ErrorPage />} element={<RequireAuth><MainPage /></RequireAuth>}>
							<Route path={'/files'} element={<ShowShowedFiles></ShowShowedFiles>}></Route>
							<Route path={'/files/search'} element={<ShowSearchedFiles></ShowSearchedFiles>}></Route>
							<Route index element={<ShowShowedFiles></ShowShowedFiles>}></Route>
							<Route path='/dirs/:diruuid' element={<ShowSharedUUIDFiles />}></Route >
							<Route path='/shared' element={<ShowSharedFiles />}></Route >
							<Route path='*' element={<ErrorPage />}></Route>
						</Route>
						<Route path='/login' errorElement={<ErrorPage />} element={<ProtectedFromAuthUser><LoginForm /></ProtectedFromAuthUser>}></Route>
					</Routes>
				</AuthProvider>
			</BrowserRouter>
		</Provider>
	</React.StrictMode>
);