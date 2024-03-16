import React, { FC, memo, useCallback, useEffect, useRef, useState } from 'react';
import { Document, Outline, Page } from 'react-pdf';
import * as pdfjsLib from 'pdfjs-dist';
import { pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { Button, Variants } from '@ui/button/Button';
import './viewPDF.scss'

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

function highlightPattern(text: string, pattern: string) {
	// TODO make css class not inline style
	const replacedText = text.replace(
		pattern,
		(value: string) =>
			`<b style="background-color:yellow; color:black;">${value}</b>`
	);

	return replacedText;
}

export interface ViewPDFProps {
	pdfURL: string;
	openPageInPDF?: number;
	searchString?: string;
	isVisible: boolean;
}

const ViewPDFBeforeMemo: FC<ViewPDFProps> = ({ pdfURL, openPageInPDF, searchString, isVisible }) => {
	const pageRefs = useRef([] as HTMLDivElement[]);
	const [searchText, setSearchText] = useState(searchString);
	const [pageNumber, setPageNumber] = useState(openPageInPDF || 1);
	const [numPages, setNumPages] = useState(0);

	const urlOfPDF = pdfURL;

	const onItemClick = ({ pageNumber }: { pageNumber: number }): void => {
		pageRefs.current[pageNumber].scrollIntoView({ behavior: 'smooth' });
		return;
	};

	const textRenderer = useCallback(
		(textItem: { str: string }) => {
			return highlightPattern(textItem.str, searchText);
		},
		[searchText]
	);

	function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
		setNumPages(numPages);
	}


	return (
		<>
			<Document
				className={'document'}
				file={{ url: urlOfPDF }}
				onLoadSuccess={onDocumentLoadSuccess}
			>
				{isVisible ? Array.from(new Array(numPages), (el, index) => {
					let funcOnLoad: () => void;
					if (index + 1 === pageNumber) {
						funcOnLoad = () => onItemClick({ pageNumber: pageNumber })
					} else {
						funcOnLoad = () => { }
					};

					return <div className='page' key={index + 1} ref={el => { pageRefs.current[index + 1] = el; }}>
						<Page
							pageNumber={index + 1}
							customTextRenderer={textRenderer}
							onLoadSuccess={funcOnLoad}
						/>
						<div className='page-number'>{index + 1}</div>
					</div>;
				}) : <></>}
			</Document>
			<Button buttonText={'Наверх'} clickHandler={() => onItemClick({ pageNumber: 1 })} variant={Variants.not_filled} />
		</>
	);
};

export const ViewPDF: FC<ViewPDFProps> = memo(ViewPDFBeforeMemo);
