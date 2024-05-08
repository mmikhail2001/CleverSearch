import React, { FC } from 'react';
import { SearchParams } from '@models/searchParams';
import {
	SelectorMulti,
} from '@entities/selectors/selectorMulti/selectorMulti';

import { fileValues, getFilesOptionFromValue, getFilesTypesToOptions, } from '@models/disk'
import { Typography } from '@mui/material';


export interface SearchFileTypeLineProps {
	changeState: React.Dispatch<
		React.SetStateAction<SearchParams>
	>;
	state: SearchParams;
	fontSize?: string,
}

export const SearchFileType: FC<SearchFileTypeLineProps> = ({
	changeState,
	state,
	fontSize,
}) => {
	return (
		<div className="line">
			<Typography fontSize={'var(--ft-body)'} className='line__name'>Type of file</Typography>
			<SelectorMulti
				clear={state.fileType && state.fileType.length === 0}
				fontSize={fontSize}
				placeholder='Any'
				options={getFilesTypesToOptions()}
				isMulti={true}
				onChange={(newVal) =>
					changeState({ ...state, fileType: fileValues(newVal) })
				}
				defaultValue={state.fileType ? state.fileType.map(val => getFilesOptionFromValue(val)) : null}
			/>
		</div>
	);
};
