import { useGetFoldersMutation } from '@api/filesApi';
import { SearchParamsLocal } from '@models/searchParams';
import { Option, SelectorAsync } from '@entities/selectors/selectorAsync/selectorAsync';
import React, { FC } from 'react';

import {transformOptionsToDirs, transformToOptions} from '@models/disk'

export interface SearchFolderLineProps {
	changeState: React.Dispatch<
		React.SetStateAction<SearchParamsLocal>
	>;
	state: SearchParamsLocal;
}



export const SearchFolderLine: FC<SearchFolderLineProps> = ({
	changeState,
	state,
}) => {
	const [searchFolder] = useGetFoldersMutation();

	return (
		<div className="line">
			<p className="search-box__text">Директория</p>
			<SelectorAsync
				cacheOptions={true}
				onChange={(newVal) =>
					changeState({ ...state, dir: transformOptionsToDirs(newVal) })
				}
				defaultOptions={true}
				loadFunction={async (query: string): Promise<Option[]> => {
					try {
						const result = await searchFolder(query).unwrap();
						return (
							transformToOptions(result) || [
								{
									label: '',
									value: '',
									color: 'black',
								},
							]
						);
					} catch (error) {
						console.error(error);
					}
					return [{ label: '', value: '', color: 'black' }] as Option[];
				}}
			/>
		</div>
	);
};
