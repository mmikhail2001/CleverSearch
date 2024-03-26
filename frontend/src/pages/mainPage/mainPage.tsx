import React, { FC, useEffect, useState } from 'react';
import { Sidebar } from '@widgets/sidebar/sidebar';
import { SearchLine } from '@widgets/searchLine/searchLine';

import { Outlet, useLocation } from 'react-router-dom';
import './mainPage.scss'
import { diskTypes, fileTypes, transformToSearchParams } from '@models/searchParams';
import { useSearchParams } from 'react-router-dom';

// TODO вынести в другой файл
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

export const MainPage: FC = () => {
	const location = useLocation()

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

	return <div className="App">
		<Sidebar></Sidebar>
		<div className="main-app">
			<SearchLine searchValue={searchState} setSearchValue={setSearchState}></SearchLine>
			<Outlet></Outlet>
		</div>
	</div>
};
