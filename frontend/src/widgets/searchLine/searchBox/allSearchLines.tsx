import { SearchParams } from '@models/searchParams';
import React, { FC } from 'react';

import { SearchFileType } from './searchLines/searchFilteType';
import { SearchFolderLine } from './searchLines/searchFolder';
import { Switch } from '@entities/switch/switch'
import { Typography } from '@mui/material';

import Tooltip from '@mui/material/Tooltip';
import { useMobile } from 'src/mobileProvider';


interface AllSearchLinesProps {
	changeState: React.Dispatch<React.SetStateAction<SearchParams>>;
	state: SearchParams;
	closeDrop: () => void;
	search: () => void;
	fontSize?: string;
}

export const AllSearchLines: FC<AllSearchLinesProps> = ({
	changeState,
	state,
	fontSize,
}) => {
	const {whatDisplay} = useMobile()
	return (
		<>
			{whatDisplay === 1 ? null : 
				<Tooltip
					slotProps={{tooltip:{style:{
							fontSize: 'var(--ft-small-text)',
							background: 'rgba(79,79,79,0.4)',
							backdropFilter: 'blur(10px)',
							border: '1px solid rgba(255,255,255,0.4)',
						}}
					}}
					title={'Smart search enables matching within files, not just their titles. It can recognize text within images, videos, and audio. Moreover, it searches by meaning rather than exact matches'}
				>
					<div className='line'>
						<Typography fontSize={'var(--ft-body)'} className='line__name'>Smart search</Typography>
						<Switch
							checked={state.smartSearch}
							disabled={false}
							onChange={() =>
								changeState({ ...state, smartSearch: !state.smartSearch })
							}
							fontSize={fontSize}
						/>
					</div>
				</Tooltip>
			}
			
			<SearchFolderLine
				fontSize={fontSize}
				changeState={changeState}
				state={state}
			/>
			<SearchFileType
				fontSize={fontSize}
				changeState={changeState}
				state={state} />
		</>
	)
};
