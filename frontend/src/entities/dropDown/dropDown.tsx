import React, { FC, useEffect, useRef, useState } from 'react';
import './dropDown.scss';
import { relative } from 'path';
import { Menu, PopoverOrigin } from '@mui/material';
import { MenuItem } from '@mui/material';
import CSS from 'csstype';
import { isNullOrUndefined } from '@helpers/isNullOrUndefined';

export type WhereToPlace = 'up' | 'down'
interface DropDownProps {
	children: React.ReactNode[]
	mainElement: React.ReactNode,
	variants?: WhereToPlace,
	isCloseOnSelect?: boolean,
	open: boolean;
	toggleOpen: (state: boolean) => void;
}

export const DropDown: FC<DropDownProps> = ({
	children,
	mainElement,
	variants,
	isCloseOnSelect,
	open,
	toggleOpen,
}) => {
	const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
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

	useEffect(() => {
		if (ref) {
			setAnchorEl(ref.current)
		}
	}, [ref])

	const isNeedCloseOnSelect = isNullOrUndefined(isCloseOnSelect) || isCloseOnSelect

	return (
		<>
			<div onClick={handleClick} ref={ref}>{mainElement}</div>
			<Menu
				anchorEl={anchorEl}
				open={open}
				onClose={handleClose}
				MenuListProps={{
					'aria-labelledby': 'basic-button',
				}}
				transformOrigin={transformOrigin}
				anchorOrigin={anchorOrigin}
			>
				{
					children.map(
						child => <MenuItem onClick={isNeedCloseOnSelect ? handleClose : null}>
							{child}
						</MenuItem>
					)
				}
			</Menu >
		</>
	);
};
