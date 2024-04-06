import React, { FC } from 'react';
import './input.scss';
import { TextFieldPropsSizeOverrides, TextFieldVariants, TextField as UIInput } from '@mui/material'

interface InputProps {
	onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
	disabled: boolean;
	placeholder: string;
	variant?: TextFieldVariants;
	type: string;
	value: string;
	onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>) => void;
	ref?: React.MutableRefObject<HTMLInputElement>
	isError?: boolean;
	size?: 'medium' | 'small';
	isFullWidth?: boolean;
}

export const Input: FC<InputProps> = ({
	onChange,
	onKeyDown,
	disabled,
	placeholder,
	variant,
	type,
	value,
	ref,
	size,
	isError,
	isFullWidth,
}) => {
	let changeHandler: (event: React.ChangeEvent<HTMLInputElement>) => void;
	if (!disabled) {
		changeHandler = onChange;
	} else {
		changeHandler = () => { };
	}

	return (
		<UIInput
			disabled={disabled}
			ref={ref}
			variant={variant}
			error={isError}
			size={size}
			fullWidth={isFullWidth}
			value={value}
			type={type}
			placeholder={placeholder}
			onKeyDown={onKeyDown}

			onChange={onChange}
		/>

		// <input
		// 	ref={ref}
		// 	onKeyDown={onKeyDown}
		// 	value={value}
		// 	type={type}
		// 	multiple={multiple}
		// 	placeholder={placeholder}
		// 	disabled={disabled}
		// 	className={[
		// 		...className,
		// 		disabled ? 'disabled-input input ' : 'input',
		// 	].join(' ')}
		// 	onChange={changeHandler}
		// ></input>
	);
};
