import React, { FC, useEffect } from 'react';
import './selector.scss';
import OutlinedInput from '@mui/material/OutlinedInput';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';

import { OptionWithImg } from '@models/additional'

interface SelectorWithImgProps {
	options: OptionWithImg[];
	isMulti?: boolean;
	onChange: (
		newValue: string[],
	) => void;
	defaultValue?: OptionWithImg;
	fontSize?: string,
}

export const SelectorWithImg: FC<SelectorWithImgProps> = ({
	options,
	isMulti,
	onChange,
	defaultValue,
	fontSize,
}) => {
	const [selectedValues, setSelectedValues] = React.useState<string[]>([]);

	const handleChange = (event: SelectChangeEvent<Element>) => {
		const {
			target: { value },
		} = event;

		if (Array.isArray(value) || typeof value === 'string') {
			onChange(typeof value === 'string' ? value.split(',') : value)
			setSelectedValues(typeof value === 'string' ? value.split(',') : value)
		}
	};

	useEffect(() => {
		if (defaultValue && (
			!selectedValues
			|| !selectedValues.find((val) => defaultValue.value === val)
		)
		) {
			setSelectedValues([defaultValue.value])
		}
	}, [defaultValue])

	return (
		<FormControl sx={{ width: '100%', height: '100%' }}>
			<Select
				MenuProps={{ slotProps: {paper: {style: {
					backgroundColor:'rgb(16, 44, 80)',
					color: 'inherit',
				}}}}}
				sx={{ 
					fontSize: fontSize,
					height: '100%',
					borderRadius: "var(--big-radius)",
					paddingLeft: '20px',
					color: 'inherit',
					border: '1px solid rgba(255,255,255,0.4)',
					"& .Mui-focused": {
						border: '1px solid rgba(255,255,255,1)',
						outline:"none",
					},
					'& .MuiOutlinedInput-notchedOutline': {
						outline: 'none',
						borderColor: 'rgba(255,255,255,0.4) !important',
					},
				  }}
				multiple={isMulti}
				displayEmpty
				onChange={handleChange}
				input={<OutlinedInput />}
				renderValue={(options) => {
					if (options === null || options === undefined) {
						return <em>Ничего не выбрано</em>
					}

					if (Array.isArray(options) && options.length !== 0) {
						return options.join(', ')
					}
					return <em>Ничего не выбрано</em>
				}}
				// @ts-expect-error Error because some bad typization inside
				value={selectedValues}
			>
				{options ? options.map((val) =>
					<MenuItem
						sx={{ fontSize: fontSize, color: 'inherit' }}
						key={val.value}
						value={val.value}
					>
						<img
							style={{
								height: `calc(${fontSize} + 0.2rem)` || 'calc(var(--ft-body) + 0.2rem)',
								paddingRight: 'var(--normal-padding)',
							}} 
							src={val.imgSrc} 
						/>
						<em>{val.label}</em>
					</MenuItem>
				) : <MenuItem disabled>Загрузка...</MenuItem>}
			</Select>
		</FormControl >
	);
};
