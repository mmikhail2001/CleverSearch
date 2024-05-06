import React, { FC } from 'react';
import { SearchParams, fileTypes } from '@models/searchParams';
import { Button } from '@entities/button/button';
import './searchBox.scss';
import { AllSearchLines } from './allSearchLines'
import CSS from 'csstype';
import { diskTypes } from '@models/disk';

// TODO make this type not structs
interface SearchBoxProps {
	changeState: React.Dispatch<React.SetStateAction<SearchParams>>;
	state: SearchParams;
	onClick: () => void;
	search: () => void;
	fontSize?: string
	style?: CSS.Properties,
	width: string,
}

const setToInitial = (
	changeState: React.Dispatch<
		React.SetStateAction<SearchParams>>,
	state: SearchParams,
) => {
	changeState({
		fileType: [],
		smartSearch: false,
		query: state.query,
		dir: [],
	});
};

export const SearchBox: FC<SearchBoxProps> = ({
	changeState,
	state,
	width,
	onClick,
	search,
	fontSize,
	style,
}) => {
	return (
		<div className="search-box" style={{...style, width: width}}>
			<AllSearchLines
				fontSize={fontSize}
				changeState={changeState}
				closeDrop={onClick}
				search={search}
				state={state}
			/>
			<div className="buttons">
				<Button
					style={{color: 'rgba(255,255,255, 0.8)'}}
					fontSize={fontSize}
					variant={'text'}
					buttonText="Clear"
					clickHandler={() => setToInitial(changeState, state)}
					disabled={false}
				></Button>
				<Button
					style={{color: 'inherit'}}	
					fontSize={fontSize}
					variant={'contained'}
					buttonText="Search"
					clickHandler={() => {
						search();
						onClick();
					}}
					disabled={false}
				></Button>
			</div>
		</div>
	);
};
