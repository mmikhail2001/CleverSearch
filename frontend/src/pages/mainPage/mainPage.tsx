import useWebSocket from 'react-use-websocket';
import { Sidebar } from '@widgets/sidebar/sidebar';
import React, { FC, useEffect, useState } from 'react';

import { useDispatch } from 'react-redux';
import { changeDir, changeDisk } from '@store/currentDirectoryAndDisk';
import { switchToShow } from '@store/whatToShow';

import { Navbar } from '@widgets/navbar/navbar';
import { Outlet, useNavigate } from 'react-router-dom';
import './mainPage.scss';
import { useMobile } from 'src/mobileProvider';
import { Button } from '@entities/button/button';
import { WSMessage } from '@models/ws'

const drawerWidth = `240px`

const useSocket = (url: string) => {
	useEffect(() => {
		const handleMessage = (ev: MessageEvent<any>) => {
			const data = ev.data;
			if (typeof data !== 'string') {
				return;
			}
			const payload: WSMessage = JSON.parse(data)

			switch (payload.typeOfMessage) {
				case (0):


			}
		}

		const ws = new WebSocket("ws://localhost:8080");
		ws.onmessage = handleMessage;
		ws.onclose = (ev) => {
			console.info("WS:connection closed: ", ev)
			setTimeout(function () {
				console.info("WS: try reconnect")
				this.connect();
			}, 500);
		}

		ws.onopen = (ev) => {
			console.info("WS:connection opened: ", ev)
		}
		ws.onerror = (ev: Event) => { console.info("WS CLOSED: ", ev) }
	}, [])
}

export const MainPage: FC = () => {
	const socketUrl = 'wss://your-websocket-url';

	const { whatDisplay } = useMobile()
	const [openSidebar, setOpenSidebar] = useState<boolean>(false)
	const navigate = useNavigate()
	const dispatch = useDispatch()

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
			// TODO make icons
			? <div className='bottom-buttons'>
				<Button
					buttonText='Домашняя'
					clickHandler={() => {
						dispatch(switchToShow())
						dispatch(changeDisk('all'))
						dispatch(changeDir({ dirs: [] }))
						navigate('/files')
					}}
					variant='outlined'
					fontSize='var(--ft-body)'
				/>
				<Button
					buttonText='Доступные'
					clickHandler={() => {
						dispatch(switchToShow())
						dispatch(changeDisk('all'))
						navigate('/shared')
					}}
					variant='outlined'
					fontSize='var(--ft-body)'
				/>
				<Button
					disabled={true}
					buttonText='Избранные'
					clickHandler={() => console.log('сделать избранные')} // TODO 
					variant='outlined'
					fontSize='var(--ft-body)'
				/>
			</div>
			: null
		}
	</div>
};
