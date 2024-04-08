import React, { FC } from 'react';
import { SearchParamsLocal, diskTypes, fileTypes } from '@models/searchParams';
import { Button } from '@entities/button/button';
import './searchBox.scss';
import { AllSearchLines } from './allSearchLines'
import CSS from 'csstype';

// TODO make this type not structs
interface SearchBoxProps {
	changeState: React.Dispatch<React.SetStateAction<SearchParamsLocal>>;
	state: SearchParamsLocal;
	onClick: () => void;
	search: () => void;
	fontSize?: string
	style?: CSS.Properties,
}

const setToInitial = (
	changeState: React.Dispatch<
		React.SetStateAction<SearchParamsLocal>>,
	state: SearchParamsLocal,
) => {
	changeState({
		fileType: ['all' as fileTypes],
		smartSearch: false,
		query: state.query,
		dir: [],
		disk: ['all'] as diskTypes[],
	});
};

export const SearchBox: FC<SearchBoxProps> = ({
	changeState,
	state,
	onClick,
	search,
	fontSize,
	style,
}) => {

	return (
		<div className="search-box" style={style}>
			<AllSearchLines
				fontSize={fontSize}
				changeState={changeState}
				closeDrop={onClick}
				search={search}
				state={state}
			/>
			<div className="buttons">
				<Button
					fontSize={fontSize}
					variant={'outlined'}
					buttonText="Сбросить"
					clickHandler={() => setToInitial(changeState, state)}
					disabled={false}
				></Button>
				<Button
					fontSize={fontSize}
					variant={'outlined'}
					buttonText="Искать"
					clickHandler={(e) => {
						search();
						onClick();
					}}
					disabled={false}
				></Button>
			</div>
		</div>
	);
};
