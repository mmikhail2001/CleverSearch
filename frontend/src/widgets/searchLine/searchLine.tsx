import { FC, useState } from 'react';
import { useSearchMutation } from '@api/searchApi';
import { diskTypes, fileTypes } from '@models/searchParams';
import { Input, InputVariants } from '@entities/input/input';
import './searchLine.scss';

import React from 'react';

import { useDispatch } from 'react-redux';
import { switchToSearch } from '@store/whatToShow';
import { SearchBox } from './searchBox/searchBox';
import { changeDir } from '@store/currentDirectoryAndDisk';
import { newValues } from '@store/searchRequest';

import SearchSVG from '@icons/Search.svg';
import FilterSVG from '@icons/Filter.svg';
import { useNavigate } from 'react-router-dom';
import { transformToSearchRequestString } from '@api/transforms';

interface SearchLineProps {
	searchValue: {
		smartSearch: boolean;
		fileType: fileTypes[];
		query: string;
		dir: string[];
		disk: diskTypes[];
	},
	setSearchValue: React.Dispatch<React.SetStateAction<{
		smartSearch: boolean;
		fileType: fileTypes[];
		query: string;
		dir: string[];
		disk: diskTypes[];
	}>>,
}

export const SearchLine: FC<SearchLineProps> = ({
	searchValue, setSearchValue
}) => {
	const [isBoxOpen, setisBoxOpen] = useState(false);

	const [search, response] = useSearchMutation({ fixedCacheKey: 'search' });
	const dispatch = useDispatch();
	const navigate = useNavigate();

	function mySearch(): void {
		search(searchValue);
		dispatch(newValues(searchValue));
		dispatch(switchToSearch());
		dispatch(changeDir({ dirs: [] }));

		const url = transformToSearchRequestString({ ...searchValue, limit: 10, offset: 0 })
		navigate(url)
	}

	return (
		<div className="search-line">
			<div className="icon-with-text">
				<div className="search-icon-container">
					<img alt="search icon" className="search-icon" src={SearchSVG}></img>
				</div>
				<div className="search-text">
					<Input
						onKeyDown={(e) => {
							if (e.key.toLowerCase() === 'enter') {
								mySearch()
							}
						}}
						onChange={(e) =>
							setSearchValue({ ...searchValue, query: e.target.value })
						}
						disabled={response.isLoading}
						placeholder={'Найдём любой файл'}
						variant={InputVariants.default}
						type={'search'}
						className={['search-input']}
						value={searchValue.query}
					/>
				</div>
			</div>
			<div
				className="filter-icon-container"
				onClick={() => setisBoxOpen(!isBoxOpen)}
			>
				<img alt="filter icon" className="filter-icon" src={FilterSVG}></img>
			</div>
			{isBoxOpen ? (
				<div className="place-for-search-box">
					<SearchBox
						changeState={setSearchValue}
						state={searchValue}
						closeDrop={() => setisBoxOpen(false)}
						search={() => {
							mySearch()
						}}
					></SearchBox>
				</div>
			) : (
				''
			)}
		</div>
	);
};
