import React, { FC } from 'react';
import './button.scss';
import { SxProps, Theme, Button as UIButton, styled } from '@mui/material';
import CSS from 'csstype';

export type VariantBtn = 'contained' | 'outlined' | 'text'
export type SizeBtn = 'small' | 'medium' | 'large'

interface ButtonProps {
	buttonText: string;
	clickHandler: (e: React.MouseEvent<HTMLButtonElement>) => void;
	disabled?: boolean;
	variant: VariantBtn;
	className?: string;
	size?: SizeBtn;
	startIconSrc?: string;
	endIcon?: React.ReactNode;
	fontSize?: string;
	isFullSize?:boolean;
	style?: CSS.Properties,
}

const UIButtonWithStyle = styled(UIButton)({
	boxShadow: '4px 6px 6px 0 rgba(var(--color-active-shadow),.08)',
	textTransform: 'none',
	fontSize: 'var(--ft-body)',
	borderRadius: 'var(--big-radius)',
	padding: '16px 24px',
	border: 'none',
	lineHeight: 1.5,
	backgroundColor: 'var(--color-active)',
	fontFamily: [
	  '-apple-system',
	  'BlinkMacSystemFont',
	  '"Segoe UI"',
	  'Roboto',
	  '"Helvetica Neue"',
	  'Arial',
	  'sans-serif',
	  '"Apple Color Emoji"',
	  '"Segoe UI Emoji"',
	  '"Segoe UI Symbol"',
	].join(','),
	'&:hover': {
	  backgroundColor: 'var(--color-active-hover)',
	  borderColor: '#0062cc',
	  boxShadow: 'none',
	},
	'&:active': {
	  boxShadow: 'none',
	  backgroundColor: 'var(--color-active-hover)',
	  borderColor: 'transparent',
	},
	'&:focus': {
	  boxShadow: '4px 6px 6px 0 rgba(var(--color-active-shadow),.5)',
	},
  });


export const Button: FC<ButtonProps> = ({
	clickHandler,
	buttonText,
	disabled,
	variant,
	className,
	size,
	startIconSrc,
	endIcon,
	fontSize,
	isFullSize,
	style,
}) => {
	if (disabled === undefined || disabled === null) disabled = false;
	let clkHandler: (e: React.MouseEvent<HTMLButtonElement>) => void;
	if (!disabled) {
		clkHandler = clickHandler;
	} else {
		clkHandler = () => { };
	}

	let cssStyles: SxProps<Theme> = {
		...style,
		textTransform: 'none',
		fontSize: fontSize,
		padding: variant === 'text' ? '0' : null,
	};

	switch (variant) {
		case 'contained':
		break;
		case 'outlined':
			cssStyles= {
				...cssStyles,
				backgroundColor: 'none',
				border: '1px solid black'
			}
		break;
		case 'text':
			cssStyles= {
				...cssStyles,
				backgroundColor: 'transparent',
				boxShadow: 'none',
				'&:hover': {
					background: 'transparent',
				},
				'&:active': {
					background: 'transparent !important',
					backgroundColor: "transparent !important",
				},
				'&:focus': {
					background: 'transparent',
					borderColor: "transparent",
					boxShadow: 'none',
				},
			}
			break;
	}

	return (
		<UIButtonWithStyle
			className={className}
			fullWidth={isFullSize}
			variant={variant}
			size={size || 'small'}
			disabled={disabled}
			onClick={clkHandler}
			startIcon={startIconSrc ? <img src={startIconSrc} /> : null}
			endIcon={endIcon ? endIcon : null}
			sx={
				{
					...cssStyles,
					"&.Mui-disabled": { 
						color: 'inherit',
						background: variant === 'text' ? 'none' : 'var(--color-active)',
						opacity: '0.3',
					  },
				}
			}
		>
			<p>{buttonText}</p>
		</UIButtonWithStyle>
	);
};
