import React, { FC, useEffect } from 'react';
import { Option } from '@models/additional'
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { OutlinedInput } from '@mui/material';
import CSS from 'csstype'

import './selector.scss';

// https://react-select.com/components
// https://www.youtube.com/watch?v=3u_ulMvTYZI&t=269s&ab_channel=MonsterlessonsAcademy


interface SelectorMultiProps {
	options: Option[];
	isMulti?: boolean;
	defaultValue?: Option[];
	onChange: (
		values: string[]
	) => void;
	maxMenuHeight?: number,
	placeholder?: string,
	notOptions?: string;
	isError?: boolean;
	fontSize?: string;
	menuStyle?: CSS.Properties,
	height?: string,
}

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
	PaperProps: {
		style: {
			maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
			width: 'auto',
			backgroundColor: 'rgb(16, 44, 80)',
			color: 'inherit',
		},
	},
};

const changeFromValueToLabel = (value: string[], options: Option[]): string[] => {
	return value.map(val => options.find((pred) => pred.value === val).label)
}

export const SelectorMulti: FC<SelectorMultiProps> = ({
	options,
	isMulti,
	onChange,
	defaultValue,
	maxMenuHeight,
	placeholder,
	notOptions,
	isError,
	fontSize,
	menuStyle,
	height,
}) => {
	const [selectedValues, setSelectedValues] = React.useState<string[]>([]);

	const handleChange = (e: SelectChangeEvent<Element>): void => {
		const {
			target: { value },
		} = e;
		if (Array.isArray(value) || typeof value === 'string') {
			onChange(typeof value === 'string'
				? value.split(',')
				: value)
			setSelectedValues(typeof value === 'string' ? value.split(',') : value)
		}
	}
	const handlerRenderValues = (renderOptions: Element): React.ReactNode => {

		if (renderOptions === null || renderOptions === undefined) {
			return <em>{placeholder}</em>
		}
		if (Array.isArray(renderOptions) && renderOptions.filter(val => val !== '').length === 0) {
			return <em>{placeholder}</em>
		}

		if (Array.isArray(renderOptions) && renderOptions.length !== 0) {
			return changeFromValueToLabel(renderOptions, options).join(', ')
		}
		return <em>{placeholder}</em>
	}
	
	useEffect(() => {
		if (defaultValue && (
			!selectedValues
			|| defaultValue.filter((val) => selectedValues.find(defVal => defVal === val.value)).length !== defaultValue.length
		)
		) {
			setSelectedValues(defaultValue.filter(val => val).map(val => val.value))	
		}
	}, [defaultValue])


	return (
		<FormControl sx={{ width: '100%', height: height }}>
			<Select
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
					'& .MuiSelect-icon': {
						color: 'inherit',
					}
				 }}
				displayEmpty
				error={isError}
				maxMenuHeight={maxMenuHeight}
				multiple={isMulti}
				onChange={handleChange}
				MenuProps={MenuProps}
				input={<OutlinedInput />}
				renderValue={handlerRenderValues}
				// @ts-expect-error Error because some bad typization inside
				value={selectedValues}
			>
				{options ?
					options.map((val) =>
						<MenuItem
							sx={{ fontSize: fontSize,...menuStyle}}
							key={val.value}
							value={val.value}
						>
							<em>{val.label}</em>
						</MenuItem>
					)
					:
					<MenuItem disabled>{notOptions}</MenuItem>
				}
			</Select>
		</FormControl>
	);
};
