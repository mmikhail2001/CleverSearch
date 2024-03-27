import React, { FC } from 'react';
import { SearchParamsLocal, diskTypes, fileTypes } from '@models/searchParams';
import { Button } from '@entities/button/button';
import './searchBox.scss';
import { AllSearchLines } from './allSearchLines'

// TODO make this type not structs
interface SearchBoxProps {
	changeState: React.Dispatch<React.SetStateAction<SearchParamsLocal>>;
	state: SearchParamsLocal;
	closeDrop: () => void;
	search: () => void;
}

const setToInitial = (
	changeState: React.Dispatch<
		React.SetStateAction<SearchParamsLocal>>,
	state: SearchParamsLocal
) => {
	changeState({
		fileType: ['all' as fileTypes],
		smartSearch: false,
		query: state.query,
		dir: [],
		disk: ['google'] as diskTypes[],
	});
};

export const SearchBox: FC<SearchBoxProps> = ({
	changeState,
	state,
	closeDrop,
	search,
}) => {
	return (
		<div className="search-box">
			<AllSearchLines changeState={changeState} closeDrop={closeDrop} search={search} state={state} />
			<div className="buttons">
				<Button
					variant={'not-filled'}
					buttonText="Сбросить"
					clickHandler={() => setToInitial(changeState, state)}
					disabled={false}
				></Button>
				<Button
					variant={'not-filled'}
					buttonText="Искать"
					clickHandler={() => {
						search();
						closeDrop();
					}}
					disabled={false}
				></Button>
			</div>
		</div>
	);
};
