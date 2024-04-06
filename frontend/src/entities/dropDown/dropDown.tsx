import React, { FC, useEffect, useRef, useState } from 'react';
import './dropDown.scss';
import { relative } from 'path';
import { Menu, PopoverOrigin } from '@mui/material';
import { MenuItem } from '@mui/material';
import CSS from 'csstype';

export type WhereToPlace = 'up' | 'down'
interface DropDownProps {
	children: React.ReactNode[]
	mainElement: React.ReactNode,
	variants?: WhereToPlace,
}

export const DropDown: FC<DropDownProps> = ({
	children,
	mainElement,
	variants
}) => {
	const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
	const open = Boolean(anchorEl);
	const handleClick = (event: React.MouseEvent<HTMLElement>) => {
		event.stopPropagation()
		setAnchorEl(event.currentTarget);
	};
	const handleClose = (event: React.MouseEvent<HTMLElement>) => {
		event.stopPropagation()
		setAnchorEl(null);
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

	return (
		<>
			<div onClick={handleClick}>{mainElement}</div>
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
						child => <MenuItem onClick={handleClose}>
							{child}
						</MenuItem>
					)
				}
			</Menu >
		</>
	);
};
