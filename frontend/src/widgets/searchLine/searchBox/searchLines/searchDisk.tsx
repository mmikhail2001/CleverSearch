import React, { FC } from 'react';
import { SearchParamsLocal } from '@models/searchParams';
import {
	SelectorWithImg,
} from '@entities/selectors/selectorOptionWIthImg/selectorOptionWithImg';

import { getDisksToOptions, diskVal, diskValueToOption } from '@models/disk'

export interface SearchDiskLineProps {
	changeState: React.Dispatch<
		React.SetStateAction<SearchParamsLocal>
	>;
	state: SearchParamsLocal;
	fontSize?: string,
}

export const SearchDiskLine: FC<SearchDiskLineProps> = ({
	changeState,
	state,
	fontSize,
}) => {
	return (
		<div className="line">
			<p className="search-box__text">Диск</p>
			<SelectorWithImg
				fontSize={fontSize}
				options={getDisksToOptions()}
				isMulti={true}
				onChange={
					(newVal) => {
						console.log("newVal", newVal)
						changeState({ ...state, disk: diskVal(newVal) })
					}
				}
				defaultValue={state.disk ? diskValueToOption(state.disk[0]) : null}
			/>
		</div>
	);
};
