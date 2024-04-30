import { SearchParams } from '@models/searchParams';
import React, { FC } from 'react';

import { SearchFileType } from './searchLines/searchFilteType';
import { SearchFolderLine } from './searchLines/searchFolder';
import { Switch } from '@entities/switch/switch'

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
	return (
		<>
			<div className='line'>
				<p className='line__name'>Smart search</p>
				<Switch
					checked={state.smartSearch}
					disabled={false}
					onChange={() =>
						changeState({ ...state, smartSearch: !state.smartSearch })
					}
					fontSize={fontSize}
				/>
			</div>
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
