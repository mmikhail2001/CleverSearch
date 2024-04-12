import React, { FC, useEffect, useState } from 'react';
import { MultiValue, SingleValue } from 'react-select';
import AsyncSelect from 'react-select/async';

import { Option } from '@models/additional'
import { debounce } from '@helpers/debounce';
import { Autocomplete, CircularProgress, TextField } from '@mui/material';
import { isNullOrUndefined } from '@helpers/isNullOrUndefined';

interface SelectorAsyncProps {
	loadFunction: (inputValue: string) => Promise<Option[]>;
	isMulti?: boolean;
	cacheOptions: boolean;
	onChange: (
		newVal: string[]
	) => void;
	defaultOption?: Option,
	debounceTime?: number,
	noOptionsText?: string,
	placeholder?: string,
	fontSize?: string,
}

export const SelectorAsync: FC<SelectorAsyncProps> = ({
	loadFunction,
	isMulti,
	cacheOptions,
	onChange,
	defaultOption,
	debounceTime,
	noOptionsText,
	placeholder,
	fontSize,
}) => {
	const [open, setOpen] = useState<boolean>(false)
	const [loading, setLoading] = useState<boolean>(false)
	const [options, setOptions] = useState<Option[]>([])

	const [selectedValues, setSelectedValues] = React.useState<string[]>([]);
	const handleChange = (event: React.SyntheticEvent<Element, Event>, value: Option): void => {
		let arrVal: Option[] = Array.isArray(value) ? value : [value]

		setSelectedValues(arrVal.map(val => val.value))
		onChange(arrVal.map(val => val.value))
	}

	const debouncedOnInputChange = debounce((query: string) => {
		setLoading(true)
		loadFunction(query).then((val) => {
			setOptions(val)
			setLoading(false)
		})
	}, debounceTime);

	useEffect(() => {
		if (defaultOption && (
			!selectedValues
			|| !selectedValues.find((val) => defaultOption.value === val)
		)
		) {
			setSelectedValues([defaultOption.value])
		}
	}, [defaultOption])

	const handleInputChange = (event: React.SyntheticEvent, value: string): void => {
		debouncedOnInputChange(value)
	}

	useEffect(() => {
		setLoading(true)
		loadFunction('').then((val) => {
			setOptions(val)
			setLoading(false)
		})
	}, [])

	return (
		<Autocomplete
			fullWidth
			multiple={isMulti}
			noOptionsText={noOptionsText}
			options={options}
			open={open}
			onOpen={() => setOpen(true)}
			onClose={() => setOpen(false)}
			loading={loading}
			isOptionEqualToValue={
				(option: Option, value: Option) => option.label === value.label
			}
			onChange={handleChange}
			filterOptions={(x) => x} // cause fetch from back
			getOptionLabel={(option) => option.label}
			defaultValue={defaultOption}
			onInputChange={handleInputChange}
			renderInput={(params) => (
				<TextField
					{...params}
					InputProps={{
						...params.InputProps,
						style: {
							fontSize: fontSize,
						}
					}}
					placeholder={placeholder}
					variant="outlined"
				/>
			)
			}
		>
		</Autocomplete >
	);
};
