import React, { FC, useEffect } from 'react';
import './selector.scss';
import { Option } from '@models/additional'
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { OutlinedInput } from '@mui/material';

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
}

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
	PaperProps: {
		style: {
			maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
			width: 'auto',
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
		<FormControl sx={{ width: '100%' }}>
			<Select
				sx={{ fontSize: fontSize }}
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
							sx={{ fontSize: fontSize }}
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
