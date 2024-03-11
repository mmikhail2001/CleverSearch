import React, { FC } from 'react';
import './selector.scss';
import Selector, { ActionMeta, MultiValue, SingleValue } from 'react-select';

// https://react-select.com/components
// https://www.youtube.com/watch?v=3u_ulMvTYZI&t=269s&ab_channel=MonsterlessonsAcademy

export interface Option {
  label: string;
  value: string;
}

interface SelectorMultiProps {
  options: Option[];
  isMulti?: boolean;
  onChange: (
    newValue: MultiValue<Option> | SingleValue<Option>,
    actionMeta: ActionMeta<Option>
  ) => void;
}

export const SelectorMulti: FC<SelectorMultiProps> = ({
	options,
	isMulti,
	onChange,
}) => {
	return (
		<Selector
			options={options}
			isMulti={isMulti}
			onChange={onChange}
		></Selector>
	);
};
