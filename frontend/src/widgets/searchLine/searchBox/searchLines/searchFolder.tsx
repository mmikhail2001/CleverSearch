import { SearchParams } from '@models/searchParams';
import { SelectorAsync } from '@entities/selectors/selectorAsync/selectorAsync';
import React, { FC } from 'react';
import { Option } from '@models/additional'

import { transformOptionsToDirs, transformToOptions } from '@models/disk'
import { Typography } from '@mui/material';
import { useGetDirsMutation } from '@api/filesApi';

export interface SearchFolderLineProps {
	changeState: (React.Dispatch<
		React.SetStateAction<SearchParams>
	>);
	state: SearchParams;
	fontSize: string,
}



export const SearchFolderLine: FC<SearchFolderLineProps> = ({
	changeState,
	state,
	fontSize,
}) => {
	const [searchFolder] = useGetDirsMutation();

	const changeDir = (dirs: string[]) => {
		changeState({ ...state, dir: dirs })
	}

	const emptyDir = !state.dir || state.dir.length === 0

	const lastDir = !emptyDir ? state.dir[state.dir.length - 1] : null
	const splitFolders = lastDir?.split('/')

	return (
		<div className="line">
			<Typography fontSize={'var(--ft-body)'} className='line__name'>Directory</Typography>
			<SelectorAsync
				style={{
					borderColor: 'rgba(255,255,255,0.4)',
					color: 'rgb(255,255,255)',
				}}
				color='#102C50'
				fontSize={fontSize}
				placeholder={'All folders'}
				defaultOption={lastDir ?
					{
						label: splitFolders[splitFolders.length - 1],
						value: lastDir,
					} : null
				}
				onChange={(newVal) => {
					changeDir([transformOptionsToDirs(newVal).join('...')])
				}
				}
				loadFunction={async (query: string): Promise<Option[]> => {
					try {
						const result = await searchFolder(query).unwrap();
						const val = transformToOptions(result) || [
							{
								label: '',
								value: '',
							},
						]
						return [{
							label: 'All folders',
							value: '/',
						}].concat(val)
					} catch (error) {
						console.error(error);
					}
					return [{ label: '', value: '' }] as Option[];
				}}
				clear={emptyDir}
			/>
		</div>
	);
};
