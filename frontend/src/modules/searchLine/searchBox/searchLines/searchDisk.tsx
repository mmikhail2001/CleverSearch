import React, { FC } from 'react';
import { MultiValue, SingleValue } from 'react-select';
import { diskImgSrc } from '../../../../models/disk';
import { diskTypes, fileTypes } from '../../../../models/searchParams';
import {
	Option,
	SelectorWithImg,
} from '../../../../ui/selectorOptionWIthImg/selectorOptionWithImg';

const getDisksToOptions = () => {
	const keys = Array.from(diskImgSrc.keys());
	const result: Option[] = Array.from(
		keys.map((key) => {
			return { label: key, value: key, imgSrc: diskImgSrc.get(key)?.src || '' };
		})
	);

	if (result && result.length !== 0) {
		return result;
	}
	return [{ label: '', value: '', imgSrc: '' }];
};

const diskVal = (
	newVal: MultiValue<Option> | SingleValue<Option>
): diskTypes[] => {
	if ('length' in newVal) {
		const diskValuesInString = newVal
			.map((val) => val.value)
			.filter((val) => val !== null) as diskTypes[];

		let newDiskValuesInString;
		if (!Array.isArray(diskValuesInString)) {
			newDiskValuesInString = [diskValuesInString];
		} else {
			newDiskValuesInString = diskValuesInString;
		}

		return newDiskValuesInString as diskTypes[];
	}
	if (newVal) {
		const diskType = newVal.value;
		if (diskType) {
			return [diskType] as diskTypes[];
		}
	}

	return ['all'];
};

export interface SearchDiskLineProps {
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

export const SearchDiskLine: FC<SearchDiskLineProps> = ({
	changeState,
	state,
}) => {
	return (
		<div className="line">
			<p className="search-box__text">Диск</p>
			<SelectorWithImg
				options={getDisksToOptions()}
				isMulti={true}
				onChange={(newVal) => changeState({ ...state, disk: diskVal(newVal) })}
			/>
		</div>
	);
};
