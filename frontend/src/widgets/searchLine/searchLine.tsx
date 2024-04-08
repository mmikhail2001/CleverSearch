import { FC, useState } from 'react';
import { useSearchMutation } from '@api/searchApi';
import { diskTypes, fileTypes } from '@models/searchParams';
import { Input } from '@entities/input/input';
import './searchLine.scss';

import React from 'react';

import { useDispatch } from 'react-redux';
import { switchToSearch } from '@store/whatToShow';
import { SearchBox } from './searchBox/searchBox';
import { changeDir } from '@store/currentDirectoryAndDisk';
import { newValues } from '@store/searchRequest';

import { useNavigate } from 'react-router-dom';
import { transformToSearchRequestString } from '@api/transforms';

import SearchIcon from '@mui/icons-material/Search';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { PopOver } from '@entities/popover/popover';
import { useMobile } from 'src/mobileProvider';
import DehazeIcon from '@mui/icons-material/Dehaze';

export interface searchStateValue {
	smartSearch: boolean;
	fileType: fileTypes[];
	query: string;
	dir: string[];
	disk: diskTypes[];
}

interface SearchLineProps {
	searchValue: searchStateValue,
	onIconClick?: () => void,
	setSearchValue: React.Dispatch<React.SetStateAction<searchStateValue>>,
	width: string,
}

export const SearchLine: FC<SearchLineProps> = ({
	searchValue,
	setSearchValue,
	onIconClick,
	width
}) => {
	const [isBoxOpen, setisBoxOpen] = useState(false);
	const [search, response] = useSearchMutation({ fixedCacheKey: 'search' });
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const { whatDisplay } = useMobile();

	function mySearch(): void {
		search(searchValue);
		dispatch(newValues(searchValue));
		dispatch(switchToSearch());
		dispatch(changeDir({ dirs: [] }));

		const url = transformToSearchRequestString({ ...searchValue, limit: 10, offset: 0 })
		navigate(url)
	}

	const renderOpenBox = (): React.ReactNode => {
		return (
			<SearchBox
				fontSize={'var(--ft-body)'}
				style={{
					width: width,
					background: 'var(--main-color-100)'
				}}
				changeState={(obj: searchStateValue) => {
					setSearchValue({ ...obj, dir: obj.dir })
				}}
				state={searchValue}
				onClick={() => setisBoxOpen(false)}
				search={() => {
					mySearch()
				}}
			></SearchBox>
		)
	}


	return (
		<PopOver
			open={isBoxOpen}
			toggleOpen={setisBoxOpen}
			isCloseOnSelect={false}
			children={[renderOpenBox()]}
			mainElement={
				<div className={["search-line", isBoxOpen ? 'open-search-line' : ''].join(' ')}
					style={{ width: width }
					}
				>
					<div className="icon-with-text" onClick={(e) => e.stopPropagation()}>
						<div className="search-icon-container"
							onClick={onIconClick}
							style={{ fontSize: 'var(--ft-title)' }}>
							{whatDisplay === 1 ?
								<SearchIcon fontSize='inherit' />
								: <DehazeIcon fontSize='inherit' />
							}
						</div>
						<div className="search-text">
							<Input
								fontSize={'var(--ft-body)'}
								isFullWidth
								variant='standard'
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
								type={'search'}
								value={searchValue.query}
							/>
						</div>
					</div>
					<div
						className="filter-icon-container"
						onClick={() => setisBoxOpen(!isBoxOpen)}
						style={{ fontSize: 'var(--ft-title)' }}
					>
						<FilterAltIcon fontSize='inherit' />
					</div>
				</div >
			}
		/>
	);
};
