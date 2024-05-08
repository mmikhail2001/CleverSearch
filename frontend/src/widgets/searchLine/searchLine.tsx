import { FC, useEffect, useState } from 'react';
import { useSearchMutation } from '@api/searchApi';
import { SearchParams, fileTypes } from '@models/searchParams';
import { Input } from '@entities/input/input';
import './searchLine.scss';

import React from 'react';

import { useDispatch } from 'react-redux';
import { switchToSearch } from '@store/whatToShow';
import { SearchBox } from './searchBox/searchBox';
import { newSearchValues } from '@store/searchRequest';

import { useNavigate } from 'react-router-dom';
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
import { newValues } from '@store/showRequest';
import { changeOpenFilter } from '@store/searchFilter';
import { getSearchURLFront } from '@helpers/transformsToURL';

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
	const [isBoxOpen, setisBoxOpen] = useState<boolean>(false);
	const [, response] = useSearchMutation({ fixedCacheKey: 'search' });
	const dispatch = useDispatch();
	const navigate = useNavigate();
	
	const {isOpen} = useAppSelector(state => state.searchFilter)

	const { whatDisplay } = useMobile();

	const {isShow, isExternal} = useAppSelector(state => state.whatToShow)

	const searchReq = useAppSelector(state => state.searchRequest)
	const showReq = useAppSelector(state => state.showRequest)
	const [searchValue, setSearchValue] = useState<SearchParams>({
		query: '',
		smartSearch: false,
	})
	
	useEffect(() => {
		setSearchValue({
			query: searchReq.query,
			smartSearch: searchReq.smartSearch,
			dir: searchReq.dir,
			fileType: searchReq.fileType,
		})
	}, [searchReq])

	useEffect(() => {
		if ((isShow || isExternal) && !compareArrays(showReq.dir, searchValue.dir)){
			setSearchValue({ ...searchValue, dir: showReq.dir })
		}
	}, [showReq.dir])

	useEffect(() => {

		setSearchValue({...searchValue, dir: searchReq.dir})
	}, [])

	if (isOpen !== isBoxOpen ) {
		dispatch(changeOpenFilter(isBoxOpen))
	}

	function mySearch(): void {
		dispatch(newSearchValues(searchValue));
		dispatch(newValues({...showReq, dir: []}))
		
		setTimeout(
			() => setisBoxOpen(false),
			0
		)
		
		const url = getSearchURLFront(searchValue.fileType,searchValue.smartSearch, searchValue.dir, searchValue.query)
		navigate(url)

		dispatch(switchToSearch());
	}

	const renderOpenBox = (): React.ReactNode => {
		return (
			<SearchBox
				width={width}
				key={'searchbox'}
				fontSize={'var(--ft-body)'}
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
			background={'transparent'}
			marginTop={'2.4rem'}
			whatCorner='left'
			variants={'down'}
			key={'search-popover-with-box'}
			open={isBoxOpen}
			toggleOpen={setisBoxOpen}
			isCloseOnSelect={false}
			mainElement={
				<div 
					className={['search-line', isBoxOpen ? 'open-search-line' : ''].join(' ')}
					style={{ width: width }}
				>
					<div className="icon-with-text" onClick={(e) => e.stopPropagation()}>
						<div className="search-icon-container"
							onClick={whatDisplay === 1 ? onIconClick : () => {
								setisBoxOpen(false)
								onIconClick()
							} }
							style={{ fontSize: 'var(--ft-pg-24)', paddingBottom: '25px' }}>
							{whatDisplay === 1 ?
								<SearchIcon fontSize='inherit' />
								: <DehazeIcon sx={{ cursor: 'pointer' }} fontSize='inherit' />
							}
						</div>
						<div className="search-text">
							<Input
								style={{backgroundColor: 'var(--color-active)', color: 'inherit' }}
								fontSize={'var(--ft-paragraph)'}
								isFullWidth
								variant='text'
								onKeyDown={(e) => {
									if (e.key.toLowerCase() === 'enter') {
										mySearch()
									}
								}}
								onChange={(e) =>
									setSearchValue({ ...searchValue, query: e.target.value })
								}
								disabled={response.isLoading}
								placeholder={'Find any file'}
								type={'search'}
								value={searchValue?.query || ''}
							/>
						</div>
					</div>
					<div
						className="filter-icon-container"
						onClick={() => {
								setTimeout(
									() => setisBoxOpen(!isBoxOpen),
									0
								)
							}
						}
						style={{ 
							fontSize: 'var(--ft-paragraph)',
							marginLeft: 'var(--normal-padding)',
						}}
					>
						<TuneIcon
							fontSize='inherit' 
						/>
					</div>
				</div >
			}
		>
			{[renderOpenBox()]}
		</PopOver>
	);
};
