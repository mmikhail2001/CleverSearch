import React, { FC } from 'react';
import './input.scss';
import { SxProps, TextFieldVariants, Theme, TextField as UIInput } from '@mui/material'

import CSS from 'csstype';
import { isNullOrUndefined } from '@helpers/isNullOrUndefined';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

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
	clearNeeded?: boolean,
	removeFocusedBorder?: boolean,
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
	clearNeeded,
	removeFocusedBorder,
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

	let cssPropsMain: SxProps<Theme> = {
		...style, 
		'& input[type="search"]::-webkit-search-cancel-button': {
			"-webkit-appearance": 'none',
			height: '1em',
			width: '1em',
			marginLeft: '.4em',
			backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='rgba(255, 255, 255, 0.8)'><path d='M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z'/></svg>")`,
			cursor: 'pointer',
		},
		"& .Mui-focused": {
			border: removeFocusedBorder? 'none !important': '1px solid rgba(255,255,255,1)',
			outline:"none !important",
		},
		'& fieldset': {
			borderRadius: 'var(--big-radius)',
			border: removeFocusedBorder? 'none !important': null,
			outline:"none !important",
		}
	};
	let cssPropsInput: CSS.Properties = {};
	switch (specificRadius) {
		case 'big-radius':
			cssPropsMain = {
				...cssPropsMain,
				color:'inherit',
				"& .Mui-focused": {
					border: removeFocusedBorder? 'none': '1px solid rgba(255,255,255,1)',
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
				'& input[type="search"]::-webkit-search-cancel-button': {
					color:'inherit',
				},
				'& fieldset': {
					borderRadius: 'var(--big-radius)',
				}
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
					border: removeFocusedBorder? 'none': '1px solid rgba(255,255,255,1)',
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
				'& input[type="search"]::-webkit-search-cancel-button': {
					color:'inherit',
				},
				'& fieldset': {
					borderRadius: 'var(--small-radius)',
				}
			}
			cssPropsInput = {
				fontSize: 'var(--ft-body)',
			}
			break;
		case 'default':
			cssPropsMain = {
				...cssPropsMain,
			}
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
		>{clearNeeded 
			? <CloseRoundedIcon 
				fontSize='inherit' 
				sx={{
					color:"inherit",
					position: 'absolute',
					right: '5px',
				}} 
			/> 
			: null} 
		</UIInput>
	);
};
