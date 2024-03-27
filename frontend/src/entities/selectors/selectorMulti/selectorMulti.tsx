import React, { FC } from 'react';
import './selector.scss';
import Selector, { ActionMeta, MultiValue, SingleValue } from 'react-select';
import { Option } from '@models/additional'

// https://react-select.com/components
// https://www.youtube.com/watch?v=3u_ulMvTYZI&t=269s&ab_channel=MonsterlessonsAcademy


interface SelectorMultiProps {
	options: Option[];
	isMulti?: boolean;
	defaultValue?: Option;
	onChange: (
		newValue: MultiValue<Option> | SingleValue<Option>,
		actionMeta: ActionMeta<Option>
	) => void;
	maxMenuHeight?: number,
}

export const SelectorMulti: FC<SelectorMultiProps> = ({
	options,
	isMulti,
	onChange,
	defaultValue,
	maxMenuHeight
}) => {
	return (
		<Selector
			maxMenuHeight={maxMenuHeight}
			options={options}
			isMulti={isMulti}
			onChange={onChange}
			defaultValue={defaultValue}
		></Selector>
	);
};
