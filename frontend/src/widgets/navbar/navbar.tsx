import React, { FC, useEffect, useState } from 'react';
import './navbar.scss';
import { UserProfile } from '@widgets/userProfile/userProfile'
import { fileTypes, transformToSearchParams } from '@models/searchParams';
import { useLocation, useSearchParams } from 'react-router-dom';
import { SearchLine } from '@widgets/searchLine/searchLine';
import { useAppSelector } from '@store/store';
import { useDispatch } from 'react-redux';
import { useMobile } from 'src/mobileProvider';
import { diskTypes } from '@models/disk';

interface NavbarProps {
	toggleSidebar?: () => void
}

const useSearchUrlParams = () => {
	const [searchParams] = useSearchParams();

	const searchParamsToObject = (params: URLSearchParams) => {
		const result: Record<string, string> = {};
		params.forEach((value, key) => {
			result[key] = value;
		});
		return result;
	};

	return searchParamsToObject(searchParams)
}


export const Navbar: FC<NavbarProps> = ({
	toggleSidebar,
}) => {
	const location = useLocation()
	const { email } = useAppSelector(state => state.userAuth)
	const { whatDisplay, currentWidth } = useMobile()

	const urlParams = useSearchUrlParams()
	const params = transformToSearchParams(urlParams)

	const [searchState, setSearchState] = useState({} as {
		smartSearch: boolean;
		fileType: fileTypes[];
		query: string;
		dir: string[];
		disk: diskTypes[];
	})

	useEffect(() => {
		setSearchState({
			smartSearch: params.smartSearch || false,
			fileType: params.fileType || ['all'],
			query: params.query || '',
			dir: params.dir || ['/'],
			disk: params.disk || ['all'],
		})
	}, [location])

	const widthToSet = whatDisplay === 1 ? '600px' : `calc(${currentWidth}px - 2*var(--big-padding))`

	return (
		<div className="navbar">
			<div className="search-bar-place" style={{ width: '100%' }}>
				<SearchLine
					width={widthToSet}
					onIconClick={toggleSidebar}
					searchValue={searchState}
					setSearchValue={setSearchState}
				/>
			</div>
			{whatDisplay === 1 ? <div className="user-profile-place">
				<UserProfile email={email} />
			</div> : null}
		</div>
	);
};
