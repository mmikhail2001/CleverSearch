import React, { FC } from 'react';
import { MultiValue, SingleValue } from 'react-select';
import { diskTypes, fileTypes, isFileType } from '../../../../models/searchParams';
import {
	Option as MultiOption,
	SelectorMulti,
} from '../../../../ui/selectorMulti/selectorMulti';

const getFilesTypesToOptions = (): MultiOption[] => {
	return [
		{
			label: 'Изображение',
			value: 'img',
		},
		{
			label: 'Текст',
			value: 'text',
		},
		{
			label: 'Видео',
			value: 'video',
		},
		{
			label: 'Аудио',
			value: 'audio',
		},
	];
};


const fileValues = (
	newVal: MultiValue<MultiOption> | SingleValue<MultiOption>
): fileTypes[] => {
	if ('length' in newVal) {
		// @ts-expect-error Nothing will happen because isFileType 
		// checks on type of file 
		const diskValuesInString: fileTypes[] = newVal
			.filter((val) => isFileType(val.value))
			.filter((val) => val !== null);

		let newDiskValuesInString;
		if (!Array.isArray(diskValuesInString)) {
			newDiskValuesInString = [diskValuesInString];
		} else {
			newDiskValuesInString = diskValuesInString;
		}

		// @ts-expect-error check value 
		return [newDiskValuesInString].map((type) => fileTypes[type]);
	}
	if (newVal) {
		if (isFileType(newVal.value)) {
			// @ts-expect-error  Nothing will happen because isFileType 
			// checks on type of file 
			return [newVal.value];
		}
	}

	return ['all' as fileTypes];
};
export interface SearchFileTypeLineProps {
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
			/>
		</div>
	);
};
