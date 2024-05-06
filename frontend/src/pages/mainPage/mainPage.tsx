import { Sidebar } from '@widgets/sidebar/sidebar';
import React, { FC, useState } from 'react';

import { useDispatch } from 'react-redux';
import { switchToLoved, switchToShow } from '@store/whatToShow';

import { useWebsoket} from '@helpers/hooks/useWebsocket'
import { Navbar } from '@widgets/navbar/navbar';
import { Outlet, useNavigate } from 'react-router-dom';
import './mainPage.scss';
import { useMobile } from 'src/mobileProvider';
import { Button } from '@entities/button/button';
import { changeDir, changeDisk } from '@store/showRequest';

import FavoriteIcon from '@mui/icons-material/Favorite';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import MonitorSVG from '@icons/disks/Monitor.svg';
import { getInternalURLFront } from '@helpers/transformsToURL';
import { useAppSelector } from '@store/store';

const drawerWidth = '294px'

export const MainPage: FC = () => {
	const { whatDisplay } = useMobile()
	const {isLoved, isShow, isShared} = useAppSelector(state => state.whatToShow)
	const [openSidebar, setOpenSidebar] = useState<boolean>(false)
	const navigate = useNavigate()
	const dispatch = useDispatch()

	useWebsoket()

	const isMobile = whatDisplay === 2
	const widthToSet = isMobile ? '0px' : drawerWidth

	return <div className="App">
		<Sidebar
			width={isMobile ? '100%' : drawerWidth}
			isMobile={isMobile}
			isOpen={openSidebar}
			toggleShow={setOpenSidebar}
		/>
		<div
			className="main-app"
			style={{
				marginLeft: isMobile ? 0 : drawerWidth,
				maxWidth: `calc(100% - ${widthToSet})`,
			}}
		>
			<Navbar
				toggleSidebar={() =>
					setOpenSidebar(!openSidebar)
				}
			/>
			<Outlet></Outlet>
		</div>
		{whatDisplay === 2
			? <div className='bottom-buttons'>
				<div className={['bottom-button', isShow ? 'selected-bottom-button':null].join(' ')}>
					<img
						style={{height: '3rem', width: '3rem'}}
						src={MonitorSVG}
						onClick={() => {
							dispatch(switchToShow())
							dispatch(changeDisk('internal'))
							dispatch(changeDir( [] ))
							navigate(getInternalURLFront([]))
						}}
					/>
				</div>
				<div className={['bottom-button', isShared ? 'selected-bottom-button':null].join(' ')}>
					<PeopleAltIcon
						onClick={() => {
							dispatch(switchToShow())
							dispatch(changeDisk('internal'))
							navigate('/shared')
						}}
						fontSize='inherit'
					/>
				</div>
				<div className={['bottom-button', isLoved ? 'selected-bottom-button':null].join(' ')}>
					<FavoriteIcon
						onClick={() => 
							{
								dispatch(switchToLoved())
								dispatch(changeDisk('internal'))
								dispatch(changeDir( [] ))
								navigate('/loved')
							}
						} 
						fontSize='inherit'
					/>
				</div>
			</div>
			: null
		}
	</div>
};
