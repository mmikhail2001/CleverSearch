import React, { FC, useState, useRef } from 'react';

// TODO make import with minimal support for our links 
// https://github.com/cookpete/react-player?tab=readme-ov-file#usage
import ReactPlayer from 'react-player'
import { ControlsForVideo } from '@entities/controlsForVideo/controlsForVideo'
import { OnProgressProps } from 'react-player/base';
import './videoPlayer.scss'
import { FullScreen, useFullScreenHandle } from 'react-full-screen'; //https://levelup.gitconnected.com/how-to-implement-full-screen-functionality-in-react-%EF%B8%8F-1281803130f4

// https://github.com/cookpete/react-player/blob/master/examples/react/src/App.js#L195
// https://cookpete.github.io/react-player/

interface VideoPlayerProps {
	url: string,
	duration: number,
	start_time?: number,
	authToken?: string,
}

interface VideoPlayerState {
	url: string,
	pip: boolean,
	playing: boolean,
	controls: boolean,
	light: boolean,
	volume: number,
	muted: boolean,
	played: number,
	loaded: number,
	duration: number,
	playbackRate: number,
	loop: boolean,
	seeking: boolean
}

export const VideoPlayer: FC<VideoPlayerProps> = ({
	url,
	start_time,
	duration,
	authToken,
}) => {
	const player = useRef<ReactPlayer>(null)
	const [state, setState] = useState<VideoPlayerState>({
		url: url,
		pip: false,
		playing: false,
		controls: false,
		light: false,
		volume: 0.8,
		muted: false,
		played: 0,
		loaded: 0,
		duration: duration || 0,
		playbackRate: 1.0,
		loop: false,
		seeking: false
	});
	const [firstTime, setFirstTime] = useState(true);
	const fullScreen = useFullScreenHandle();

	const handleOnPlaybackRateChange = (speed: string) => {
		setState({ ...state, playbackRate: parseFloat(speed) })
	}

	const handlePlay = () => {
		setState({ ...state, playing: true })
	}

	const handlePause = () => {
		setState({ ...state, playing: false })
	}

	const handleProgress = (passedState: OnProgressProps) => {
		// We only want to update time slider if we are not currently seeking
		if (!state.seeking) {
			setState({ ...state, played: passedState.playedSeconds })
		}
	}

	const handleDuration = (duration: number) => {
		setState({ ...state, duration })
	}

	return (
		<div className='video-player'>
			<FullScreen handle={fullScreen} className='fullscreen-player'>
				<ReactPlayer
					ref={player}
					className='react-player'
					width='100%'
					height='100%'
					url={state.url}
					pip={state.pip}
					playing={state.playing}
					controls={state.controls}
					light={state.light}
					loop={state.loop}
					playbackRate={state.playbackRate}
					volume={state.volume}
					muted={state.muted}
					onPlay={handlePlay}
					progressInterval={10}
					onPause={handlePause}
					onPlaybackRateChange={handleOnPlaybackRateChange}
					onError={(e, data, f, g) => console.info('onError', e, data, f, g)}
					onProgress={handleProgress}
					onDuration={handleDuration}
					onReady={(pl) => {
						if (firstTime) {
							pl.seekTo(start_time || 0)
							setFirstTime(false)
						}
					}}
				>
				</ReactPlayer>
				<ControlsForVideo
					isPlaying={state.playing}
					currentTime={state.played}
					maxTime={state.duration}
					currentVolume={state.volume}
					setTime={(time: number) => player.current?.seekTo(time)}
					start={() => setState({ ...state, playing: true })}
					stop={() => setState({ ...state, playing: false })}
					changeSpeed={(desiredSpeed) => setState({ ...state, playbackRate: desiredSpeed })}
					setVolume={(desiredVolume) => setState({ ...state, volume: desiredVolume })}
					toggleFullScreen={() => {
						fullScreen.active ? fullScreen.exit() : fullScreen.enter()
					}}
				/>
			</FullScreen>
		</div>
	);
};
