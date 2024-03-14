import { useGetFoldersMutation } from '@api/filesApi';
import { diskTypes, fileFile, fileTypes } from '@models/searchParams';
import { Option, SelectorAsync } from '@ui/selectorAsync/selectorAsync';
import React, { FC } from 'react';
import { MultiValue, SingleValue } from 'react-select';

const transformToOptions = (folders: fileFile[]): Option[] => {
	return folders.map((folder) => {
		return {
			label: String(folder.filename),
			value: String(folder.filename),
			color: 'black',
		};
	});
};

export interface SearchFolderLineProps {
  changeState: React.Dispatch<
    React.SetStateAction<{
      smartSearch: boolean;
      fileType: fileTypes[];
      query: string;
      dir: string;
      disk: diskTypes[];
    }>
  >;
  state: {
    smartSearch: boolean;
    fileType: fileTypes[];
    query: string;
    dir: string;
    disk: diskTypes[];
  };
}

const transformToString = (
	newVal: SingleValue<Option> | MultiValue<Option>
): string => {
	if ('length' in newVal) {
		return newVal.map((val) => val.value).join(',');
	}
	if (newVal) return newVal.value;
	return '';
};

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
					changeState({ ...state, dir: transformToString(newVal) })
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
