import React, { FC } from 'react';
import './Button.scss';

export enum Variants {
  filled = 'filled',
  not_filled = 'not-filled',
}

interface ButtonProps {
  buttonText: string;
  clickHandler: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  variant: Variants;
}

function getClassForButton(disabled: boolean, variant: Variants): string {
	let out: string = '';
	if (disabled) {
		out = 'button disabled-button';
	} else {
		out = 'button';
	}

	out += ' ' + variant;
	return out;
}

export const Button: FC<ButtonProps> = ({
	clickHandler,
	buttonText,
	disabled,
	variant,
}) => {
	if (disabled) disabled=false;
	let clkHandler: (e: React.MouseEvent<HTMLButtonElement>) => void;
	if (!disabled) {
		clkHandler = clickHandler;
	} else {
		clkHandler = () => {};
	}

	return (
		<button
			disabled={disabled}
			className={getClassForButton(disabled, variant)}
			onClick={clkHandler}
		>
			<p>{buttonText}</p>
		</button>
	);
};
