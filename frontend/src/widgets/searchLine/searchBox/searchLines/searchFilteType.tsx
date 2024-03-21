import React, { FC } from 'react';
import { SearchParamsLocal } from '@models/searchParams';
import {
	SelectorMulti,
} from '@entities/selectors/selectorMulti/selectorMulti';

import { fileValues, getFilesOptionFromValue, getFilesTypesToOptions, } from '@models/disk'


export interface SearchFileTypeLineProps {
	changeState: React.Dispatch<
		React.SetStateAction<SearchParamsLocal>
	>;
	state: SearchParamsLocal;
}

export const SearchFileType: FC<SearchFileTypeLineProps> = ({
	changeState,
	state,
}) => {
	return (
		<div className="line">
			<p className="search-box__text">Тип файла</p>
			<SelectorMulti
				options={getFilesTypesToOptions()}
				isMulti={true}
				onChange={(newVal) =>
					changeState({ ...state, fileType: fileValues(newVal) })
				}
				defaultValue={state.fileType ? getFilesOptionFromValue(state.fileType[0]) : null}
			/>
		</div>
	);
};
