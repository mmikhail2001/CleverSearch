import React, { FC } from 'react';
import { SearchParamsLocal } from '@models/searchParams';
import {
	SelectorMulti,
} from '@entities/selectors/selectorMulti/selectorMulti';

import { fileValues, getFilesOptionFromValue, getFilesTypesToOptions, } from '@models/disk'
import { Typography } from '@mui/material';


export interface SearchFileTypeLineProps {
	changeState: React.Dispatch<
		React.SetStateAction<SearchParamsLocal>
	>;
	state: SearchParamsLocal;
	fontSize?: string,
}

export const SearchFileType: FC<SearchFileTypeLineProps> = ({
	changeState,
	state,
	fontSize,
}) => {
	return (
		<div className="line">
			<Typography fontSize={'var(--ft-body)'}>Тип файла</Typography>
			<SelectorMulti
				fontSize={fontSize}
				placeholder='Любой'
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
