import { useGetFoldersMutation } from '@api/filesApi';
import { SearchParamsLocal } from '@models/searchParams';
import { SelectorAsync } from '@entities/selectors/selectorAsync/selectorAsync';
import React, { FC } from 'react';
import { Option } from '@models/additional'

import { transformOptionsToDirs, transformToOptions } from '@models/disk'

export interface SearchFolderLineProps {
	changeState: (React.Dispatch<
		React.SetStateAction<SearchParamsLocal>
	>);
	state: SearchParamsLocal;
}



export const SearchFolderLine: FC<SearchFolderLineProps> = ({
	changeState,
	state,
}) => {
	const [searchFolder] = useGetFoldersMutation();

	const changeDir = (dirs: string[]) => {
		changeState({ ...state, dir: dirs })
	}

	const lastDir = state.dir[state.dir.length - 1]
	const splitFolders = lastDir?.split('/')

	return (
		<div className="line">
			<p className="search-box__text">Директория</p>
			<SelectorAsync
				placeholder={'Все папки'}
				defaultOption={lastDir ?
					{
						label: splitFolders[splitFolders.length - 1],
						value: lastDir,
					} : null
				}
				cacheOptions={true}
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
						return val
					} catch (error) {
						console.error(error);
					}
					return [{ label: '', value: '' }] as Option[];
				}}
			/>
		</div>
	);
};
