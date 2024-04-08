import { SearchParamsLocal } from '@models/searchParams';
import React, { FC } from 'react';

import { SearchDiskLine } from './searchLines/searchDisk';
import { SearchFileType } from './searchLines/searchFilteType';
import { SearchFolderLine } from './searchLines/searchFolder';
import { Checkbox } from '@entities/checkbox/Checkbox';
import { Switch } from '@entities/switch/switch'
import { styled } from '@mui/material/styles';
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
			<div className="line">
				<Switch
					checked={state.smartSearch}
					disabled={false}
					onChange={() =>
						changeState({ ...state, smartSearch: !state.smartSearch })
					}
					fontSize={fontSize}
					label='Умный поиск'
					labelPlacement='start'
				/>
			</div>
			<SearchFolderLine
				fontSize={fontSize}
				changeState={changeState}
				state={state}
			></SearchFolderLine>
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
