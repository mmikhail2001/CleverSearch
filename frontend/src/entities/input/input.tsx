import React, { FC } from 'react';
import './input.scss';
import { Paper, SxProps, TextFieldVariants, Theme, TextField as UIInput } from '@mui/material'

import CSS from 'csstype';
import { isNullOrUndefined } from '@helpers/isNullOrUndefined';

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
	specificRadius?: 'big-radius' | 'small-radius' | 'default',
	specificPaddingInside?: 'big-padding' | 'small-padding' | 'default',
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
	specificRadius,
	specificPaddingInside,
}) => {
	let changeHandler: (event: React.ChangeEvent<HTMLInputElement>) => void;
	if (!disabled) {
		changeHandler = onChange;
	} else {
		changeHandler = () => { };
	}

	if (isNullOrUndefined(specificPaddingInside)) specificPaddingInside = 'default'

	let setPadding:number;
	switch(specificPaddingInside) {
		case 'small-padding':
			setPadding = 10;
			break;
		case 'big-padding':
		case 'default':
			setPadding = 15
	}

	let cssPropsMain: SxProps<Theme> = {...style};
	let cssPropsInput: CSS.Properties = {};

	switch (specificRadius) {
		case 'big-radius':
			cssPropsMain = {
				...cssPropsMain,
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
					padding: `${setPadding}px !important`, 
				},
				'& input[type=password]': {
					padding: `${setPadding}px !important`, 
				},
				'& input[type=text]': {
					padding: `${setPadding}px !important`, 
				},
			}
			cssPropsInput = {
				fontSize: 'var(--ft-body)',
			}
			break;
		case 'small-radius':
			cssPropsMain = {
				...cssPropsMain,
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
					padding: `${setPadding}px !important`, 
				},
				'& input[type=password]': {
					padding: `${setPadding}px !important`, 
				},
				'& input[type=text]': {
					padding: `${setPadding}px !important`, 
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
