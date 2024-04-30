import React, { FC, useEffect, useState } from 'react';

import { Option } from '@models/additional'
import { debounce } from '@helpers/debounce';
import { Autocomplete, TextField } from '@mui/material';
import CSS from 'csstype'


interface SelectorAsyncProps {
	loadFunction: (inputValue: string) => Promise<Option[]>;
	isMulti?: boolean;
	onChange: (
		newVal: string[]
	) => void;
	defaultOption?: Option,
	debounceTime?: number,
	noOptionsText?: string,
	placeholder?: string,
	fontSize?: string,
	style?: CSS.Properties,
	color?: string,
}

export const SelectorAsync: FC<SelectorAsyncProps> = ({
	loadFunction,
	isMulti,
	onChange,
	defaultOption,
	debounceTime,
	noOptionsText,
	placeholder,
	fontSize,
	style,
	color,
}) => {
	const [open, setOpen] = useState<boolean>(false)
	const [loading, setLoading] = useState<boolean>(false)
	const [options, setOptions] = useState<Option[]>([])

	const [selectedValues, setSelectedValues] = React.useState<string[]>([]);
	const handleChange = (event: React.SyntheticEvent<Element, Event>, value: Option): void => {
		const arrVal: Option[] = Array.isArray(value) ? value : [value]

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
			sx={{
				fontSize: fontSize, 
				...style, 
				height:'100%',
				'& > fieldset' : {border: 'none'},
			}}
			fullWidth
			slotProps={
				{paper:{style:{
					backgroundColor: color,
					borderColor: 'rgba(255,255,255,0.4)',
					color: 'rgb(255,255,255)',
				}},
				}
			}
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
			renderOption={(props, option, state) => {
				return <li 
					{...props}
					style={{
						fontSize: fontSize, 
						color: 'inherits', 
					}}
				>
					{option.label}
				</li>
			}}
			renderInput={(params) => (
				<TextField
					{...params}
					InputProps={{
						...params.InputProps,
						style: {
							fontSize: fontSize,
							color: 'inherit',
							outline: 'none',
							height:"100%",
						},
					}}
					sx={{
						height: '100%',
						border: '1px solid rgba(255,255,255,0.4)',
						color: 'rgb(255,255,255)',
						borderRadius: 'var(--big-radius)',
						"& .MuiOutlinedInput-root": {
							borderRadius: "var(--big-radius)",
							border: '1px solid rgba(255,255,255,0.4)',
			
							legend: {
							  marginLeft: "20px"
							}
						  },
						"& .MuiButtonBase-root": {
							color: 'white',
						},
						"& .MuiAutocomplete-inputRoot": {
							paddingLeft: "20px !important",
							borderRadius: "var(--big-radius)",
							border: '1px solid rgba(255,255,255,0.4)',
						},
						"& .MuiInputLabel-outlined": {
							paddingLeft: "20px",
						},
						"& .Mui-focused": {
							border: '1px solid rgba(255,255,255,1)',
							outline:"none",
						},
						'& MuiOutlinedInput-notchedOutline': {
							// border: 'none',
							borderColor: 'rgba(255,255,255,0.4) !important',
						},
						'& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
							border: 'none',
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
