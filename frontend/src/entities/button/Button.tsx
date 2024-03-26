import React, { FC } from 'react';
import './Button.scss';

export type Variants = 'filled' | 'not-filled' | 'button-text'

interface ButtonProps {
	buttonText: string;
	clickHandler: (e: React.MouseEvent<HTMLButtonElement>) => void;
	disabled?: boolean;
	variant: Variants;
	className?: string;
}

function getClassForButton(disabled: boolean, variant: Variants): string {
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
}) => {
	if (disabled === undefined || disabled === null) disabled = false;
	let clkHandler: (e: React.MouseEvent<HTMLButtonElement>) => void;
	if (!disabled) {
		clkHandler = clickHandler;
	} else {
		clkHandler = () => { };
	}

	return (
		<button
			disabled={disabled}
			className={[className, getClassForButton(disabled, variant)].join(' ')}
			onClick={clkHandler}
		>
			<p>{buttonText}</p>
		</button>
	);
};
