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

	const widthToSet = whatDisplay === 1 ? '600px' : `calc(${currentWidth}px - 2*var(--big-padding))`

	return (
		<div className="navbar">
			<div className="search-bar-place" style={{ width: '100%' }}>
				<SearchLine
					width={widthToSet}
					onIconClick={toggleSidebar}
				/>
			</div>
			{whatDisplay === 1 ? <div className="user-profile-place">
				<UserProfile email={email} />
			</div> : null}
		</div>
	);
};
