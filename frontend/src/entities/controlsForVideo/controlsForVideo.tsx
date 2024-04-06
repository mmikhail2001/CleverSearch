import React, { FC, useState } from 'react';

// TODO make import with minimal support for our links 
// https://github.com/cookpete/react-player?tab=readme-ov-file#usage
import './controlsForVideo.scss'

import PlayImg from '@icons/player/Play.svg'
import StopImg from '@icons/player/Stop.svg'
import BackwardImg from '@icons/player/Backward.svg'
import ForwardImg from '@icons/player/Forward.svg'
import FullscreenImg from '@icons/player/FullScreen.svg'
import VolumeLow from '@icons/player/Volume low.svg'
import { DropDown } from '@entities/dropDown/dropDown';
import { Box, Slider } from '@mui/material'

interface ControlsForVideoProps {
	currentTime: number,
	maxTime: number,
	setTime: (timeToSet: number) => void,
	start: () => void,
	stop: () => void,
	toggleFullScreen?: () => void,
	changeSpeed: (desiredSpeed: number) => void,
	currentVolume: number,
	// Can accept only from 0 to 1
	setVolume: (desiredVolume: number) => void
	isPlaying: boolean,
}

export const ControlsForVideo: FC<ControlsForVideoProps> = ({
	currentTime,
	maxTime,
	setTime,
	start,
	stop,
	toggleFullScreen,
	changeSpeed,
	currentVolume,
	setVolume,
	isPlaying,
}) => {
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (Number(e.target.value)) {
			setTime(Number(e.target.value))
		}
	}

	const getValueForInput = (duration: number, current: number): number => {
		if (duration !== 0) {
			return current / maxTime * 0.999999
		}
		return 0
	}

	console.log('currentVolume', currentVolume)
	return (
		<div className='controls-container'>
			<div className='progress-bar-container' style={{ position: 'relative' }}>
				<input
					className='progress-bar'
					max={0.999999}
					min={0}
					value={getValueForInput(maxTime, currentTime)}
					step={0.000001}
					type='range'
					style={{ width: '100%', height: '100%' }}
					onChange={handleChange} />
			</div>
			<div className='controls'>
				<div className='start-stop-container'>
					{!isPlaying ?
						< img className='start-img contorl-img' src={PlayImg} alt={'Start'} onClick={start} />
						:
						< img className='stop-img contorl-img' src={StopImg} alt={'Stop'} onClick={stop} />
					}
				</div>
				<div className='rewind-container'>
					<div className='rewind-back-container'>
						< img
							className='rewind-back-img contorl-img'
							src={BackwardImg}
							alt={'Go back'}
							onClick={() => setTime(currentTime - 5)}
						/>
					</div>
					<div className='rewind-forward-container'>
						< img
							className='rewind-forward-img contorl-img'
							src={ForwardImg}
							alt={'Go forward'}
							onClick={() => setTime(currentTime + 5)}
						/>
					</div>
				</div>
				<div className='speed-container'>
					{/* TODO make speed dropdown */}
					<p onClick={() => changeSpeed(1)}>x1</p>
					<p onClick={() => changeSpeed(2)}>x2</p>
				</div>
				<div className='volume-container'>
					{/* TODO think about children */}
					<DropDown
						variants='up'
						mainElement={
							< img className='volume-img contorl-img'
								src={VolumeLow}
								alt={'Volume-low'}
							/>}
						children={
							[
								<Box sx={
									{
										height: 130,
										overflow: 'hidden',
										'boxSizing': 'border-box',
									}
								}
									display={'flex'}
									alignItems={'center'}
								>
									<Slider
										sx={{
											height: 105,
											'& input[type="range"]': {
												WebkitAppearance: 'slider-vertical',
											},
										}}
										orientation="vertical"
										value={currentVolume}
										max={1}
										min={0}
										step={0.01}
										onChange={(e, val) => {
											if ('value' in e.target) {
												let value = Array.isArray(val) ? val[0] : val;
												if (isNaN(value)) value = 0.5
												setVolume(value)
											}
										}}
									/>
								</Box>
							]
						}
					>
					</DropDown>
				</div>
				<div className='fullscreen-container'>
					< img className='fullscreen-img contorl-img' src={FullscreenImg} alt={'Fullscreen'} onClick={toggleFullScreen} />
				</div>
			</div>
		</div>
	)
};
