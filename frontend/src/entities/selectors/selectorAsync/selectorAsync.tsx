import React, { FC, useState } from 'react';
import { MultiValue, SingleValue } from 'react-select';
import AsyncSelect from 'react-select/async';

import { Option } from '@models/additional'

interface SelectorAsyncProps {
	loadFunction: (inputValue: string) => Promise<Option[]>;
	isMulti?: boolean;
	defaultOptions: boolean;
	cacheOptions: boolean;
	onChange: (
		e: SingleValue<Option> | MultiValue<Option>
	) => void;
	selectedValue?: Option,
}

export const SelectorAsync: FC<SelectorAsyncProps> = ({
	loadFunction,
	isMulti,
	defaultOptions,
	cacheOptions,
	onChange,
	selectedValue,
}) => {
	const [selVal, setSelectedValue] = useState(selectedValue as SingleValue<Option> | MultiValue<Option>);
	const handleChange = (newVal: SingleValue<Option> | MultiValue<Option>) => {
		setSelectedValue(newVal)
		onChange(newVal)
	}
	return (
		<AsyncSelect
			value={selVal}
			defaultOptions={defaultOptions}
			onChange={handleChange}
			cacheOptions={cacheOptions}
			loadOptions={loadFunction}
			isMulti={isMulti}
		></AsyncSelect>
	);
};
