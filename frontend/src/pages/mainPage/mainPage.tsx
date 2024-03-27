import { Sidebar } from '@widgets/sidebar/sidebar';
import React, { FC } from 'react';

import { Navbar } from '@widgets/navbar/navbar';
import { Outlet } from 'react-router-dom';
import './mainPage.scss';

export const MainPage: FC = () => {
	return <div className="App">
		<Sidebar></Sidebar>
		<div className="main-app">
			<Navbar />
			<Outlet></Outlet>
		</div>
	</div>
};
