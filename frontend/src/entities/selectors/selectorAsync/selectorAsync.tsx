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
	clear?: boolean,
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
	clear,
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

	useEffect(() => {
		if (clear) {
			setSelectedValues([])
		}
	}, [clear])

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

	const getSelectedValueToOptions = (): null | Option[] => {
		if (selectedValues.length === 0) {
			return null
		}

		return selectedValues.map((val) => {
			return {
				label: val.replace(/^\//, ''),
				value: val,
			}
		})
	}
	const selectedOptions = React.useMemo(getSelectedValueToOptions, [selectedValues])

	const getOptionLabel = (opt: Option | Option[]): string => {
		if (Array.isArray(opt))  {
			return opt.map(val => val.label).join(', ')
		}
		return opt.label
	}

	const renderOption = (props: React.HTMLAttributes<HTMLLIElement>, option: Option | Option[]) => {
		const transfromToOption = (opt: Option) => {
			return <li 
					{...props}
					style={{
						fontSize: fontSize, 
						color: 'inherits', 
					}}
				>
					{opt.label}
				</li>
		}

		if (Array.isArray(option))  {
			return option.map(val => transfromToOption(val))
		}
		return transfromToOption(option)
	}

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
			value={selectedOptions}
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
			getOptionLabel={getOptionLabel}
			defaultValue={defaultOption}
			onInputChange={handleInputChange}
			renderOption={renderOption}
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
