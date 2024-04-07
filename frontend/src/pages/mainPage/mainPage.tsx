import { Sidebar } from '@widgets/sidebar/sidebar';
import React, { FC, useState } from 'react';

import { Navbar } from '@widgets/navbar/navbar';
import { Outlet } from 'react-router-dom';
import './mainPage.scss';
import { useMobile } from 'src/mobileProvider';
import { Button } from '@entities/button/button';
import DehazeIcon from '@mui/icons-material/Dehaze';

const drawerWidth = `240px`

export const MainPage: FC = () => {
	const { whatDisplay } = useMobile()
	const [openSidebar, setOpenSidebar] = useState<boolean>(false)

	const isMobile = whatDisplay === 2

	return <div className="App">
		<Sidebar
			width={drawerWidth}
			isMobile={isMobile}
			isOpen={openSidebar}
			toggleShow={setOpenSidebar}
		/>
		<div className="main-app" >
			<Navbar
				toggleSidebar={() =>
					setOpenSidebar(!openSidebar)
				}
			/>
			<Outlet></Outlet>
		</div>
	</div>
};
