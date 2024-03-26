import React, { FC } from 'react';
import './selector.scss';
import Selector, {
	components,
	ActionMeta,
	MultiValue,
	SingleValue,
	GroupBase,
	OptionProps,
} from 'react-select';
import { OptionWithImg } from '@models/additional'
// https://codesandbox.io/p/sandbox/react-select-icon-oxzd3?file=%2Fsrc%2FApp.js%3A13%2C1-18%2C3

export interface propsData extends OptionProps<OptionWithImg, boolean, GroupBase<OptionWithImg>> {
}

const OptionComp = (props: propsData) => (
	<components.Option {...props} className="selector-option">
		<img src={props.data.imgSrc} alt="logo" className="option-img" />
		{props.data.label}
	</components.Option>
);

interface SelectorWithImgProps {
	options: OptionWithImg[];
	isMulti?: boolean;
	onChange: (
		newValue: MultiValue<OptionWithImg> | SingleValue<OptionWithImg>,
		actionMeta: ActionMeta<OptionWithImg>
	) => void;
	defaultValue?: OptionWithImg;
}

export const SelectorWithImg: FC<SelectorWithImgProps> = ({
	options,
	isMulti,
	onChange,
	defaultValue,
}) => {
	return (
		<Selector
			options={options}
			isMulti={isMulti}
			onChange={onChange}
			components={{ Option: OptionComp }}
			defaultValue={defaultValue}
		></Selector>
	);
};
