import React, { FC } from 'react';
import './navbar.scss';
import { UserProfile } from '@widgets/userProfile/userProfile'
import { SearchLine } from '@widgets/searchLine/searchLine';
import { useAppSelector } from '@store/store';
import { useMobile } from 'src/mobileProvider';

interface NavbarProps {
	toggleSidebar?: () => void
}

export const Navbar: FC<NavbarProps> = ({
	toggleSidebar,
}) => {
	const { email } = useAppSelector(state => state.userAuth)
	const { whatDisplay, currentWidth } = useMobile()

	let widthToSet;

	if (whatDisplay === 1) {
		if (currentWidth > 1250) {
			widthToSet = '672px'
		} else {
			widthToSet = '550px'			
		}
	} else {
		widthToSet = `calc(${currentWidth}px - 2*var(--big-padding))`
	}

	return (
		<div className="navbar">
			<div className="search-bar-place" key={'search-line-placement'} style={{ width: 'fit-content' }}>
				<SearchLine
					width={widthToSet}
					onIconClick={toggleSidebar}
				/>
			</div>
			{whatDisplay === 1 ? <div className="user-profile-place" key={'user-profile-placement-navbar'}>
				<UserProfile key={'user-profile-navbar'} email={email} />
			</div> : null}
		</div>
	);
};
