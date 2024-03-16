import React, { FC, useState } from 'react';
import { Sidebar } from '@modules/sidebar/sidebar';
import { SearchLine } from '@modules/searchLine/searchLine';
import { DataShow } from '@modules/dataShow/dataShow';
import { ViewPDF } from '@ui/viewPDF/viewPDF';
import { Button, Variants } from '@ui/button/Button';

export const MainPage: FC = () => {
	const [isOpen, setOpen] = useState(false);

	return <div className="App">
		<Sidebar></Sidebar>
		<div className="main-app">
			<SearchLine></SearchLine>
			<DataShow></DataShow>
		</div>
	</div>
};
