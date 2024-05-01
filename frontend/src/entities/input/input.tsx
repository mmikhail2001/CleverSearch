import React, { FC } from 'react';
import './input.scss';
import { Paper, SxProps, TextFieldVariants, Theme, TextField as UIInput } from '@mui/material'

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
	style?: SxProps<Theme>,
	border?:string,
	sepecificVariant?: 'big-radius' | 'small-radius' | 'default',
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
	border,
	sepecificVariant,
}) => {
	let changeHandler: (event: React.ChangeEvent<HTMLInputElement>) => void;
	if (!disabled) {
		changeHandler = onChange;
	} else {
		changeHandler = () => { };
	}

	let cssPropsMain: SxProps<Theme> = {};
	let cssPropsInput: CSS.Properties = {};

	switch (sepecificVariant) {
		case 'big-radius':
			cssPropsMain = {
				color:'inherit',
				"& .Mui-focused": {
					border: '1px solid rgba(255,255,255,1)',
					outline:"none",
				},
				'& .MuiOutlinedInput-notchedOutline': {
					outline: 'none',
					borderColor: 'rgba(255,255,255,0.4) !important',
				},
				'& input[type=email]': {
					padding: '15px !important', 
				},
				'& input[type=password]': {
					padding: '15px !important', 
				},
			}
			cssPropsInput = {
				fontSize: 'var(--ft-body)',
			}
			break;
		case 'small-radius':
			cssPropsMain = {
				color:'inherit',
				"& .Mui-focused": {
					border: '1px solid rgba(255,255,255,1)',
					outline:"none",
				},
				'& .MuiOutlinedInput-notchedOutline': {
					outline: 'none',
					borderColor: 'rgba(255,255,255,0.4) !important',
				},
				'& input[type=email]': {
					padding: '15px !important', 
				},
				'& input[type=password]': {
					padding: '15px !important', 
				},
			}
			cssPropsInput = {
				fontSize: 'var(--ft-body)',
			}
			break;
		case 'default':
		default:
	}

	return (
		<UIInput
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
			sx={{ 
				fontSize: fontSize, 
				...cssPropsMain,
			}}
			InputProps={{
				disableUnderline: variant === 'text',
				style: {
					...cssPropsInput,
					fontSize: fontSize, 
					color: 'inherit',
					border: border,
				},
			}}
			onChange={changeHandler}
		/>
	);
};
