import React, { FC } from 'react';
import './button.scss';
import { Button as UIButton } from '@mui/material';

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
}

function getClassForButton(disabled: boolean, variant: VariantBtn): string {
	let out: string = '';
	if (disabled) {
		out = 'button disabled-button';
	} else {
		out = 'button';
	}
	out += disabled ? ` ${variant}` + ` disabled-${variant} ` : ` ${variant}`;
	return out;
}

export const Button: FC<ButtonProps> = ({
	clickHandler,
	buttonText,
	disabled,
	variant,
	className,
	size,
	startIconSrc,
}) => {
	if (disabled === undefined || disabled === null) disabled = false;
	let clkHandler: (e: React.MouseEvent<HTMLButtonElement>) => void;
	if (!disabled) {
		clkHandler = clickHandler;
	} else {
		clkHandler = () => { };
	}

	return (
		<UIButton
			variant={variant}
			size={size || 'small'}
			disabled={disabled}
			onClick={clkHandler}
			startIcon={startIconSrc ? <img src={startIconSrc} /> : null}
			sx={{ textTransform: 'none' }}
		>
			<p>{buttonText}</p>
		</UIButton>
	);
};
