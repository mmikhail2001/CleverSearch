import React, { FC } from 'react';
import './input.scss';

export enum InputVariants {
  default = 'default',
}

interface InputProps {
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  disabled: boolean;
  placeholder: string;
  variant?: InputVariants;
  className: string[];
  type: string;
  value: string;
  multiple?: boolean;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  ref?: React.MutableRefObject<HTMLInputElement>
}

export const Input: FC<InputProps> = ({
	onChange,
	onKeyDown,
	disabled,
	placeholder,
	variant,
	multiple,
	type,
	className,
	value,
	ref,
}) => {
	let changeHandler: (event: React.ChangeEvent<HTMLInputElement>) => void;
	if (!disabled) {
		changeHandler = onChange;
	} else {
		changeHandler = () => {};
	}

	return (
		<input
		ref={ref}
			onKeyDown={onKeyDown}
			value={value}
			type={type}
			multiple={multiple}
			placeholder={placeholder}
			disabled={disabled}
			className={[
				...className,
				disabled ? 'disabled-input input ' : 'input',
			].join(' ')}
			onChange={changeHandler}
		></input>
	);
};
