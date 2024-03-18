import React, { FC, memo, useCallback, useEffect, useRef, useState } from 'react';
import { Document, Outline, Page, pdfjs } from 'react-pdf';
import * as pdfjsLib from 'pdfjs-dist';
// import pdfjs from 'react-pdf';
// import pdfjs from 'pdfjs-dist'
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { Button, Variants } from '@ui/button/Button';
import './viewPDF.scss'

import { Test } from './test'
import PdfUrlViewer from './newViewPDF/PdfUrlViewer'

// pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

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

console.log('version', pdfjsLib.version)
// pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;
// pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/browse/pdfjs-dist@${pdfjs.version}/build/pdf.worker.mjs`;

const ViewPDFBeforeMemo: FC<ViewPDFProps> = ({ pdfURL, openPageInPDF, searchString, isVisible }) => {
	// const pageRefs = useRef([] as HTMLDivElement[]);
	// const [searchText, setSearchText] = useState(searchString);
	// const [pageNumber, setPageNumber] = useState(openPageInPDF || 1);
	// const [numPages, setNumPages] = useState(0);
	// console.log("PDF")

	// const urlOfPDF = pdfURL;

	// const onItemClick = ({ pageNumber }: { pageNumber: number }): void => {
	// 	pageRefs.current[pageNumber].scrollIntoView({ behavior: 'smooth' });
	// 	return;
	// };

	// const textRenderer = useCallback(
	// 	(textItem: { str: string }) => {
	// 		return highlightPattern(textItem.str, searchText);
	// 	},
	// 	[searchText]
	// );


	// const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
	// 	setNumPages(numPages);
	// }, [])


	// function renderPage(el: any, index: number) {
	// 	console.log("pages", searchText, pageNumber, numPages)
	// 	let funcOnLoad: () => void;
	// 	if (index + 1 === pageNumber) {
	// 		funcOnLoad = () => onItemClick({ pageNumber: pageNumber })
	// 	} else {
	// 		funcOnLoad = () => { }
	// 	};

	// 	return <div className='page' key={index + 1} ref={el => { pageRefs.current[index + 1] = el; }}>
	// 		<Page
	// 			pageNumber={index + 1}
	// 			customTextRenderer={textRenderer}
	// 			onLoadSuccess={funcOnLoad}
	// 		/>
	// 		<div className='page-number'>{index + 1}</div>
	// 	</div>;
	// }


	// const RenderDoc = memo(function RenderDoc({ classname, urlOfFile, onDocumentLoadSuccess }: { classname: string, urlOfFile: string, onDocumentLoadSuccess: ({ numPages }: { numPages: number }) => void }) {
	// 	return <Document
	// 		className={classname}
	// 		file={{ url: urlOfFile }}
	// 		onLoadSuccess={onDocumentLoadSuccess}
	// 	>
	// 		{isVisible && numPages !== 0 ? Array.from(new Array(numPages), renderPage) : <></>}
	// 	</Document>
	// })

	// return (
	// 	<>
	// 		<RenderDoc
	// 			classname={'document'}
	// 			urlOfFile={urlOfPDF}
	// 			onDocumentLoadSuccess={onDocumentLoadSuccess} />
	// 		<Button buttonText={'Наверх'} clickHandler={() => onItemClick({ pageNumber: 1 })} variant={Variants.not_filled} />
	// 	</>
	// );
	// retur <Test url={pdfURL}></Test>
	const windowRef = useRef();
	return < PdfUrlViewer url={pdfURL} />
};

export const ViewPDF: FC<ViewPDFProps> = memo(ViewPDFBeforeMemo);
