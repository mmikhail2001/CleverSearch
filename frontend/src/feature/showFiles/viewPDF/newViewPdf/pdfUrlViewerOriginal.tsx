import * as pdfjs from 'pdfjs-dist';
import { DocumentInitParameters, PDFDocumentLoadingTask, PDFDocumentProxy } from 'pdfjs-dist/types/src/display/api';
import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import { VariableSizeList } from 'react-window';
import PdfViewer from './pdfViewerOriginal';
import { PdfControls } from './pdfControls';
import { CircularProgress } from '@mui/material';

export interface PdfUrlViewerProps {
  url: string,
  pages: number[],
}

const PdfUrlViewer: FC<PdfUrlViewerProps> = ({ url, pages }) => {
  const pdfRef = useRef<PDFDocumentProxy>();
  const windowRef = useRef<VariableSizeList>(null)
  const [itemCount, setItemCount] = useState(0);
  const [isFirstPageLoaded, setFirstPageLoaded] = useState(false);
  const [settedScale, setsettedScale] = useState(1);

  const [currentPage, setCurrentPage] = useState<number>(pages[0] || 0)
  const [currentPageToShow, setCurrentPageToshow] = useState<number>(pages[0] || 0)

  const [firstScroll, setFirstScroll] = useState<boolean>(true)

  const scrollToItem = () => {
    windowRef?.current && windowRef.current.scrollToItem(currentPage, 'start');
  };

  useEffect(() => {
    scrollToItem()
    setTimeout(() => {
      scrollToItem()
    }, 300);
  }, [])

  useEffect(() => {
    let loadingTask: PDFDocumentLoadingTask;

    loadingTask = pdfjs.getDocument(url);

    loadingTask.promise.then(
      pdf => {
        pdfRef.current = pdf;

        setItemCount(pdf._pdfInfo.numPages);
      },
      reason => {
        console.error(reason);
      }
    );
  }, [url]);

  const handleGetPdfPage = useCallback((index: number) => {
    return pdfRef.current?.getPage(index + 1);
  }, []);

  useEffect(() => {
    scrollToItem()
  }, [isFirstPageLoaded, currentPage])

  return (
    <div className='pdf-with-controls'>
        <PdfControls
          searchPages={pages}
          changePage={(page) => {
            setFirstScroll(false)
            setCurrentPage(page-1)
            setCurrentPageToshow(page)
          }}
          currentPage={currentPageToShow}
          maxPage={itemCount}
          scale={settedScale}
          zoomOut={() => setsettedScale(p => p + 0.25)}
          zoomIn={() => setsettedScale(p => p - 0.25)}
        />
        
        {isFirstPageLoaded ? null : <div style={{width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '1.2rem'}}>
            <CircularProgress></CircularProgress>
          </div>}

        <PdfViewer
          scrollPage={page => {setFirstScroll(false); setCurrentPageToshow(page)}}
          windowRef={windowRef}
          itemCount={itemCount}
          getPdfPage={handleGetPdfPage}
          onLoad={() => { setFirstPageLoaded(true); }}
          scale={settedScale}
          gap={40}
        />
    </div>
  );
};


export default PdfUrlViewer;
