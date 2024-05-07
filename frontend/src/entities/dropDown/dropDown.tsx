import React, { FC, useEffect, useRef, useState } from 'react';
import './dropDown.scss';
import { Menu, PopoverOrigin } from '@mui/material';
import { MenuItem } from '@mui/material';
import CSS from 'csstype';
import { isNullOrUndefined } from '@helpers/isNullOrUndefined';

export type WhereToPlace = 'up' | 'down' | 'down-center' | 'up-center'
interface DropDownProps {
	children: React.ReactNode[]
	mainElement: React.ReactNode,
	variants?: WhereToPlace,
	isCloseOnSelect?: boolean,
	open: boolean;
	toggleOpen: (state: boolean) => void;
	className?: string;
	styleOnMain?: CSS.Properties;
	borderRadius?: "big" | 'small';
}

export const DropDown: FC<DropDownProps> = ({
	className,
	children,
	mainElement,
	variants,
	isCloseOnSelect,
	open,
	toggleOpen,
	styleOnMain,
	borderRadius,
}) => {
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const ref = useRef<HTMLDivElement>(null)

	const handleClick = (event: React.MouseEvent<HTMLElement>) => {
		event.stopPropagation()
		toggleOpen(true)
	};

	const handleClose = (event: React.MouseEvent<HTMLElement>) => {
		event.stopPropagation()
		toggleOpen(false)
	};

	let transformOrigin: PopoverOrigin
	let anchorOrigin: PopoverOrigin

	// Tranform playground
	//https://mui.com/material-ui/react-popover/#anchor-playground
	switch (variants) {
		case 'up':
			anchorOrigin = {
				vertical: 'top',
				horizontal: 'right',

			}
			transformOrigin = {
				vertical: 'bottom',
				horizontal: 'right',

			}
			break;
		case 'down-center':
			anchorOrigin = {
				vertical: 'bottom',
				horizontal: 'center',

			}
			transformOrigin = {
				vertical: 'top',
				horizontal: 'center',
			}
			break;
		case 'up-center':
			anchorOrigin = {
				vertical: 'top',
				horizontal: 'center',
			}

			transformOrigin = {
				vertical: 'bottom',
				horizontal: 'center',
			}
			break;
		case 'down':
		default:
			anchorOrigin = {
				vertical: 'bottom',
				horizontal: 'right',

			}
			transformOrigin = {
				vertical: 'top',
				horizontal: 'right',
			}

	}

	if (isNullOrUndefined(borderRadius)) borderRadius = 'small'

	useEffect(() => {
		if (ref) {
			setAnchorEl(ref.current)
		}
	}, [ref])

	const isNeedCloseOnSelect = isNullOrUndefined(isCloseOnSelect) || isCloseOnSelect

	return (
		<>
			<div
				className={className}
				onClick={handleClick}
				ref={ref}
				style={styleOnMain}
			>
				{mainElement}
			</div>
			<Menu
				sx={{
					'& > div': {
						backgroundColor: 'transparent',
						borderRadius: borderRadius === 'big' ? 'var(--big-radius)' : 'var(--small-radius)',
						border: 'none',
						boxShadow:'3px 3px 10px 4px rgba(0,0,0,0.1)',
						color:'inherit',
					}}
				}
				disableAutoFocusItem
				disableAutoFocus
				anchorEl={anchorEl}
				open={open}
				onClose={handleClose}
				MenuListProps={{
					'aria-labelledby': 'basic-button',
					style: {
						backgroundColor: 'var(--color-dropdowns)',
					}
				}}
				transformOrigin={transformOrigin}
				anchorOrigin={anchorOrigin}
			>
				{
					children.filter((val) => !isNullOrUndefined(val)).map(
						child => <MenuItem
							key={child.toString().slice(-5, -9)}
							onClick={isNeedCloseOnSelect ? handleClose : null}
							sx={{
								fontSize: 'var(--ft-small-text)',
							}}
						>
							{child}
						</MenuItem>
					)
				}
			</Menu >
		</>
	);
};
