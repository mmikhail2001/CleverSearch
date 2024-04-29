import { SearchParamsLocal } from '@models/searchParams';
import React, { FC } from 'react';

import { SearchDiskLine } from './searchLines/searchDisk';
import { SearchFileType } from './searchLines/searchFilteType';
import { SearchFolderLine } from './searchLines/searchFolder';
import { Switch } from '@entities/switch/switch'

interface AllSearchLinesProps {
	changeState: React.Dispatch<React.SetStateAction<SearchParamsLocal>>;
	state: SearchParamsLocal;
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
				<p className='line__name'>Умный поиск</p>
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
			<SearchDiskLine
				fontSize={fontSize}
				changeState={changeState}
				state={state} />
			<SearchFileType
				fontSize={fontSize}
				changeState={changeState}
				state={state} />
		</>
	)
};
