import React, { FC } from 'react';
import { diskTypes, fileTypes } from '../../../models/searchParams';
import { Button, Variants } from '../../../ui/button/Button';
import { Checkbox } from '../../../ui/checkbox/Checkbox';
import './searchBox.scss';
import { SearchDiskLine } from './searchLines/searchDisk';
import { SearchFileType } from './searchLines/searchFilteType';
import { SearchFolderLine } from './searchLines/searchFolder';

interface SearchBoxProps {
  changeState: React.Dispatch<
    React.SetStateAction<{
      smartSearch: boolean;
      fileType: fileTypes[];
      query: string;
      dir: string;
      disk: diskTypes[];
    }>
  >;
  state: {
    smartSearch: boolean;
    fileType: fileTypes[];
    query: string;
    dir: string;
    disk: diskTypes[];
  };
  closeDrop: () => void;
  search: () => void;
}

const setToInitial = (
	changeState: React.Dispatch<
    React.SetStateAction<{
      smartSearch: boolean;
      fileType: fileTypes[];
      query: string;
      dir: string;
      disk: diskTypes[];
    }>
  >,
	state: {
    smartSearch: boolean;
    fileType: fileTypes[];
    query: string;
    dir: string;
    disk: diskTypes[];
  }
) => {
	changeState({
		fileType: ['all' as fileTypes],
		smartSearch: false,
		query: state.query,
		dir: '',
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
			<div className="line">
				<p className="search-box__text">Умный поиск</p>
				<Checkbox
					isChecked={state.smartSearch}
					disabled={false}
					clickHandler={() =>
						changeState({ ...state, smartSearch: !state.smartSearch })
					}
				/>
			</div>

			<SearchFolderLine
				changeState={changeState}
				state={state}
			></SearchFolderLine>
			<SearchDiskLine changeState={changeState} state={state}></SearchDiskLine>
			<SearchFileType changeState={changeState} state={state}></SearchFileType>
			<div className="buttons">
				<Button
					variant={Variants.not_filled}
					buttonText="Сбросить"
					clickHandler={() => setToInitial(changeState, state)}
					disabled={false}
				></Button>
				<Button
					variant={Variants.not_filled}
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
