import { FC, useEffect, useState } from 'react';
import { useSearchMutation } from '@api/searchApi';
import { SearchParams, fileTypes } from '@models/searchParams';
import { Input } from '@entities/input/input';
import './searchLine.scss';

import React from 'react';

import { useDispatch } from 'react-redux';
import { switchToSearch } from '@store/whatToShow';
import { SearchBox } from './searchBox/searchBox';
import { changeDir } from '@store/currentDirectoryAndDisk';
import { newValues } from '@store/searchRequest';

import { useLocation, useNavigate } from 'react-router-dom';
import { transformToSearchRequestString } from '@api/transforms';

import SearchIcon from '@mui/icons-material/Search';
import TuneIcon from '@mui/icons-material/Tune';
import { PopOver } from '@entities/popover/popover';
import { useMobile } from 'src/mobileProvider';
import DehazeIcon from '@mui/icons-material/Dehaze';
import { diskTypes } from '@models/disk';
import { ConnectedClouds } from '@models/user';

import { useAppSelector } from '@store/store';
import { compareArrays } from '@helpers/hooks/useShowParams';

export interface searchStateValue {
	smartSearch: boolean;
	fileType: fileTypes[];
	query: string;
	dir: string[];
	disk: diskTypes[] | ConnectedClouds[];
}

interface SearchLineProps {
	onIconClick?: () => void,
	width: string,
}

export const SearchLine: FC<SearchLineProps> = ({
	onIconClick,
	width
}) => {
	const [isBoxOpen, setisBoxOpen] = useState(false);
	const [search, response] = useSearchMutation({ fixedCacheKey: 'search' });
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const { whatDisplay } = useMobile();
	const { dirs } = useAppSelector(state => state.currentDirDisk)

	const {isShow} = useAppSelector(state => state.whatToShow)

	const searchParams = useAppSelector(state => state.searchRequest)
	const [searchValue, setSearchValue] = useState<SearchParams>({
		query: '',
		smartSearch: false,
	})
	
	useEffect(() => {
		setSearchValue({
			query: searchParams.query,
			smartSearch: searchParams.smartSearch,
			dir: searchParams.dir,
			disk: searchParams.disk,
			fileType: searchParams.fileType,
		})
	}, [searchParams])

	if (isShow && !compareArrays(dirs, searchValue.dir)){
		setSearchValue({ ...searchValue, dir: dirs })
	}

	useEffect(() => {
		setSearchValue({...searchValue, dir: searchParams.dir})
	}, [])

	function mySearch(): void {
		dispatch(switchToSearch());
		dispatch(newValues(searchValue));
		dispatch(changeDir({ dirs: [] }));

		const url = transformToSearchRequestString({ ...searchValue, limit: 10, offset: 0 })
		navigate(url)
	}
	const renderOpenBox = (): React.ReactNode => {
		return (
			<SearchBox
				key={'searchbox'}
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
			key={'search-popover-with-box'}
			open={isBoxOpen}
			toggleOpen={setisBoxOpen}
			isCloseOnSelect={false}
			children={[renderOpenBox()]}
			mainElement={
				<div className={['search-line', isBoxOpen ? 'open-search-line' : ''].join(' ')}
					style={{ width: width }
					}
				>
					<div className="icon-with-text" onClick={(e) => e.stopPropagation()}>
						<div className="search-icon-container"
							onClick={onIconClick}
							style={{ fontSize: 'var(--ft-title)' }}>
							{whatDisplay === 1 ?
								<SearchIcon fontSize='inherit' />
								: <DehazeIcon sx={{ cursor: 'pointer' }} fontSize='inherit' />
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
								value={searchValue?.query || ''}
							/>
						</div>
					</div>
					<div
						className="filter-icon-container"
						onClick={() => setisBoxOpen(!isBoxOpen)}
						style={{ fontSize: 'var(--ft-title)' }}
					>
						<TuneIcon fontSize='inherit' />
					</div>
				</div >
			}
		/>
	);
};
