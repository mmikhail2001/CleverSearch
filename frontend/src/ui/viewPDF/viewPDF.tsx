import React, { FC, memo, useCallback, useEffect, useRef, useState } from 'react';
import { Document, Outline, Page, pdfjs } from 'react-pdf';
import * as pdfjsLib from 'pdfjs-dist';
// import pdfjs from 'react-pdf';
// import pdfjs from 'pdfjs-dist'
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import './viewPDF.scss'

import PdfUrlViewer from './newViewPDF/pdfUrlViewer'

export interface ViewPDFProps {
	pdfURL: string;
	openPageInPDF?: number;
	searchString?: string;
}

/**
 * Render pdf document
 * @param pdfURL is url where we get pdf 
 * @param openPageInPDF what page to open when visualize pdf
 * @param searchString not supported. For future updates 
 * @returns 
 */
export const ViewPDF: FC<ViewPDFProps> = React.memo(({ pdfURL, openPageInPDF, searchString }) => {
	// https://codesandbox.io/p/sandbox/3vnx878jk5?file=%2Findex.js%3A1%2C1-31%2C1 -- sample of code that in PdfUrlViewer
	// react-window docs https://github.com/bvaughn/react-window?tab=readme-ov-file
	// more docs https://react-window.vercel.app/#/examples/list/fixed-size
	// Good examples https://codesandbox.io/examples/package/react-virtualized-auto-sizer
	// https://www.youtube.com/watch?v=UrgfPjX97Yg&ab_channel=LogRocket
	// search with pdfjs = https://stackoverflow.com/questions/35501417/how-to-search-with-pdf-js/39770115#39770115
	return < PdfUrlViewer url={pdfURL} page={openPageInPDF} />
});

