import React, { FC } from 'react';
import './navbar.scss';

interface NavbarProps {}

export const Navbar: FC<NavbarProps> = () => {
	return (
		<div className="navbar">
			<div className="search-bar-place"></div>
			<div className="user-profile-place"></div>
		</div>
	);
};
