import React, { FC } from 'react';
import './input.scss';
import { TextFieldVariants, TextField as UIInput } from '@mui/material'

import CSS from 'csstype';

interface InputProps {
	onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
	disabled: boolean;
	placeholder: string;
	variant?: TextFieldVariants | 'text';
	type: string;
	value: string;
	onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>) => void;
	ref?: React.MutableRefObject<HTMLInputElement>
	isError?: boolean;
	size?: 'medium' | 'small';
	isFullWidth?: boolean;
	fontSize?: string;
	style?: CSS.Properties
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
	fontSize,
	style,
}) => {
	let changeHandler: (event: React.ChangeEvent<HTMLInputElement>) => void;
	if (!disabled) {
		changeHandler = onChange;
	} else {
		changeHandler = () => { };
	}

	let cssProps: CSS.Properties = style || {};

	return (
		<UIInput
			style={cssProps}
			disabled={disabled}
			ref={ref}
			variant={variant === 'text' ? 'standard' : variant}
			error={isError}
			size={size}
			fullWidth={isFullWidth}
			value={value}
			type={type}
			placeholder={placeholder}
			onKeyDown={onKeyDown}
			sx={{ fontSize: fontSize }}
			InputProps={{
				disableUnderline: variant === 'text',
				style: { fontSize: fontSize, color: 'inherit'}
			}}
			onChange={changeHandler}
		/>
	);
};
