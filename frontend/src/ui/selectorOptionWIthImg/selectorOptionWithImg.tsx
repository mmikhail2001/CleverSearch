import React, { FC } from 'react';
import './selector.scss';
import Selector, {
	components,
	ActionMeta,
	MultiValue,
	SingleValue,
} from 'react-select';

// https://codesandbox.io/p/sandbox/react-select-icon-oxzd3?file=%2Fsrc%2FApp.js%3A13%2C1-18%2C3

export interface Option {
	label: string;
	value: string;
	imgSrc: string;
}


// HACK any type below
const OptionComp = (props: any) => (
	<components.Option {...props} className="selector-option">
		<img src={props.data.imgSrc} alt="logo" className="option-img" />
		{props.data.label}
	</components.Option>
);

interface SelectorWithImgProps {
	options: Option[];
	isMulti?: boolean;
	onChange: (
		newValue: MultiValue<Option> | SingleValue<Option>,
		actionMeta: ActionMeta<Option>
	) => void;
}

export const SelectorWithImg: FC<SelectorWithImgProps> = ({
	options,
	isMulti,
	onChange,
}) => {
	return (
		<Selector
			options={options}
			isMulti={isMulti}
			onChange={onChange}
			components={{ Option: OptionComp }}
		></Selector>
	);
};
