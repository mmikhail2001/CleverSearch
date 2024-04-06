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
}


export const AllSearchLines: FC<AllSearchLinesProps> = ({
	changeState,
	state,
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
					label='Умный поиск'
					labelPlacement='start'
				/>
			</div>
			<SearchFolderLine
				changeState={changeState}
				state={state}
			></SearchFolderLine>
			<SearchDiskLine changeState={changeState} state={state}></SearchDiskLine>
			<SearchFileType changeState={changeState} state={state}></SearchFileType>
		</>
	)
};
