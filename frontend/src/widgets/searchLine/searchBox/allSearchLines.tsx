import { SearchParamsLocal } from '@models/searchParams';
import React, { FC } from 'react';

import { SearchDiskLine } from './searchLines/searchDisk';
import { SearchFileType } from './searchLines/searchFilteType';
import { SearchFolderLine } from './searchLines/searchFolder';
import { Checkbox } from '@entities/checkbox/Checkbox';

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
				<p className="search-box__text">Умный поиск</p>
				<Checkbox
					isChecked={state.smartSearch}
					disabled={false}
					clickHandler={() =>
						changeState({ ...state, smartSearch: !state.smartSearch })
					}
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
