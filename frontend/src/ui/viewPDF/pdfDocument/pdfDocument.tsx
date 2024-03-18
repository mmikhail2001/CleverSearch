// import React, { FC, ReactElement, useEffect, useRef, useState } from 'react';
// import ReactDOM from 'react-dom';
// import pdfjs from 'pdfjs-dist';
// import { PDFPageProxy } from 'pdfjs-dist';
// import useResizeObserver from "use-resize-observer";

// // pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;


// interface PdfDocumentProps {
//     urlOfPDF: string;
// }

// interface PageInfo {
//     pageNumber: number;
//     page: PDFPageProxy;
// }

// export const PdfDocument: FC<PdfDocumentProps> = ({
//     urlOfPDF
// }) => {
//     const [pages, setPages] = useState([] as PageInfo[])

//     const {
//         ref,
//         width: internalWidth = 400,
//         height: internalHeight = 600
//     } = useResizeObserver();

//     useEffect(() => {
//         pdfjs.getDocument(urlOfPDF).promise.then(pdf => {
//             for (let i = 0; i < pdf.numPages; i++) {
//                 // setPages(prev => {
//                 //     let pageLoad = pdf.getPage()
//                 //     numbepdf.numPages
//                 // })
//             }

//             pdf.getPage(1).then(page => {
//             })
//         })
//     }, [urlOfPDF])

//     const renderPage = (pageInfo: PageInfo) => {

//     }

//     return (
//         <div className='pdf-document'>
//             {Array.from(new Array(numPages), renderPage)}
//         </div>
//     )
// };
