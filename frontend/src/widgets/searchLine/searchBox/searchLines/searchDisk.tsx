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
	const defaultValue = typeof state.disk[0] === 'string'
		? state.disk[0]
		: state.disk[0].disk

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
				defaultValue={state.disk ? diskValueToOption(defaultValue) : null}
			/>
		</div>
	);
};
