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
import { ShowDriveFiles } from '@widgets/showResults/showDriveFiles/showDriveFiles'
import { ShowSearchedFiles } from '@widgets/showResults/showSearchedFiles/showSearchedFiles'
import { ShowSharedFiles } from '@widgets/showResults/showSharedFiles/showSharedFiles'
import { ShowProcessedFiles } from '@widgets/showResults/showProcessed/showProcessed'
import { ShowSharedUUIDFiles } from '@widgets/showResults/showSharedFiles/showSharedUUIDFiles'

import './App.scss'

// @ts-expect-error Do not what error is here. Not find any types of this 
import * as pdfjsLib from 'pdfjs-dist/webpack.mjs';
// import 'node_modules/pdfjs-dist/web/pdf_viewer.css';


import { MobileProvider } from './mobileProvider';
import { SettingsPage } from '@pages/settingsPage/settingsPage'
import { RegisterForm } from '@pages/registerPage/register';
import { ShowLovedFiles } from '@widgets/showResults/showLovedFiles/showLovedFiles';
import { SnackbarProvider } from 'notistack';

const root = ReactDOM.createRoot(
	document.getElementById('root') as HTMLElement
);

pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;

root.render(
	<React.StrictMode>
		<Provider store={store}>
			<BrowserRouter>
				<AuthProvider>
					<MobileProvider>
						<SnackbarProvider>
							<Routes>
								<Route path='/' errorElement={<ErrorPage />} element={<RequireAuth><MainPage /></RequireAuth>}>
									<Route path={'/internal'} element={<ShowShowedFiles></ShowShowedFiles>}></Route>
									<Route path={'/drive'} element={<ShowDriveFiles></ShowDriveFiles>}></Route>
									<Route path={'/search'} element={<ShowSearchedFiles></ShowSearchedFiles>}></Route>
									<Route index element={<ShowShowedFiles></ShowShowedFiles>}></Route>
									<Route path='/dirs/:diruuid' element={<ShowSharedUUIDFiles />}></Route >
									<Route path='/shared' element={<ShowSharedFiles />}></Route >
									<Route path='/uploaded' element={<ShowProcessedFiles />}></Route >
									<Route path='/loved' element={<ShowLovedFiles />}></Route >
									<Route path='*' element={<ErrorPage />}></Route>
								</Route>
								<Route path='/settings' element={<RequireAuth><SettingsPage /></RequireAuth>} ></Route>
								<Route path='/login' errorElement={<ErrorPage />} element={<ProtectedFromAuthUser><LoginForm /></ProtectedFromAuthUser>}></Route>
								<Route path='/register' errorElement={<ErrorPage />} element={<ProtectedFromAuthUser><RegisterForm /></ProtectedFromAuthUser>}></Route>
							</Routes>
						</SnackbarProvider>
					</MobileProvider>
				</AuthProvider>
			</BrowserRouter>
		</Provider>
	</React.StrictMode>
);