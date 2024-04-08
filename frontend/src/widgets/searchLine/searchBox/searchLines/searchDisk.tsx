import React, { FC } from 'react';
import { SearchParamsLocal } from '@models/searchParams';
import {
	SelectorWithImg,
} from '@entities/selectors/selectorOptionWIthImg/selectorOptionWithImg';

import { getDisksToOptions, diskVal, diskValueToOption } from '@models/disk'
import { Typography } from '@mui/material';

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
			<Typography fontSize={'var(--ft-body)'}>Диск</Typography>
			<SelectorWithImg
				fontSize={fontSize}
				options={getDisksToOptions()}
				isMulti={true}
				onChange={
					(newVal) => {
						changeState({ ...state, disk: diskVal(newVal) })
					}
				}
				defaultValue={state.disk ? diskValueToOption(state.disk[0]) : null}
			/>
		</div>
	);
};
