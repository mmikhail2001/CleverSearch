import React, { FC, useEffect, useState } from 'react';
import './navbar.scss';
import { UserProfile } from '@widgets/userProfile/userProfile'
import { diskTypes, fileTypes, transformToSearchParams } from '@models/searchParams';
import { useLocation, useSearchParams } from 'react-router-dom';
import { SearchLine } from '@widgets/searchLine/searchLine';
import { useAppSelector } from '@store/store';
import { useDispatch } from 'react-redux';

interface NavbarProps { }

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


export const Navbar: FC<NavbarProps> = () => {
	const location = useLocation()
	const { email } = useAppSelector(state => state.userAuth)

	const dispatch = useDispatch()

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

	return (
		<div className="navbar">
			<div className="search-bar-place">
				<SearchLine searchValue={searchState} setSearchValue={setSearchState}></SearchLine>
			</div>
			<div className="user-profile-place">
				<UserProfile email={email} />
			</div>
		</div>
	);
};
