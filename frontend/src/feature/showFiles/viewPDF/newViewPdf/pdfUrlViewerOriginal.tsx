import * as pdfjs from 'pdfjs-dist';
import { DocumentInitParameters, PDFDocumentLoadingTask, PDFDocumentProxy } from 'pdfjs-dist/types/src/display/api';
import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import { VariableSizeList } from 'react-window';
import PdfViewer from './pdfViewerOriginal';
import { PdfControls } from './pdfControls';
import { CircularProgress } from '@mui/material';

export interface PdfUrlViewerProps {
  url: string,
  page: number,
}

const PdfUrlViewer: FC<PdfUrlViewerProps> = ({ url, page }) => {
  const pdfRef = useRef<PDFDocumentProxy>();
  const windowRef = useRef<VariableSizeList>(null)
  const [itemCount, setItemCount] = useState(0);
  const [isFirstPageLoaded, setFirstPageLoaded] = useState(false);
  const [settedScale, setsettedScale] = useState(1);

  const [currentPage, setCurrentPage] = useState<number>(page || 0)

  const scrollToItem = () => {
    windowRef?.current && windowRef.current.scrollToItem(currentPage, 'start');
  };

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
          changePage={(page) => setCurrentPage(page-1)}
          currentPage={currentPage + 1}
          maxPage={itemCount}
          scale={settedScale}
          zoomIn={() => setsettedScale(p => p + 0.25)}
          zoomOut={() => setsettedScale(p => p - 0.25)}
        />
        
        {isFirstPageLoaded ? null : <div style={{width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '1.2rem'}}>
            <CircularProgress></CircularProgress>
          </div>}

        <PdfViewer
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
