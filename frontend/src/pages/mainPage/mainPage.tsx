import React, { FC } from 'react';
import {Sidebar} from '@modules/sidebar/sidebar';
import { SearchLine } from '@modules/searchLine/searchLine';
import { DataShow } from '@modules/dataShow/dataShow';

export const MainPage: FC = () => (
	<div className="App">
		<Sidebar></Sidebar>
		<div className="main-app">
			<SearchLine></SearchLine>
			<DataShow></DataShow>
		</div>
	</div>
);
