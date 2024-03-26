import * as pdfjs from 'pdfjs-dist';
import { PDFDocumentProxy } from 'pdfjs-dist/types/src/display/api';
import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import { VariableSizeList } from 'react-window';
import PdfViewer from './pdfViewer';

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

  const scrollToItem = () => {
    windowRef?.current && windowRef.current.scrollToItem(page - 1, 'start');
  };

  useEffect(() => {
    const loadingTask = pdfjs.getDocument(url);
    loadingTask.promise.then(
      pdf => {
        pdfRef.current = pdf;

        setItemCount(pdf._pdfInfo.numPages);
      },
      reason => {
        // PDF loading error
        console.error(reason);
      }
    );
  }, [url]);

  const handleGetPdfPage = useCallback((index: number) => {
    return pdfRef.current?.getPage(index + 1);
  }, []);

  useEffect(() => {
    scrollToItem()
  }, [isFirstPageLoaded])

  return (
    <>
      <PdfViewer
        windowRef={windowRef}
        itemCount={itemCount}
        getPdfPage={handleGetPdfPage}
        onLoad={() => { setFirstPageLoaded(true); }}
        scale={settedScale}
        gap={40}
      />
      <div>
        Scale
        <div onClick={() => setsettedScale(p => p + 0.5)}>+</div>
        <div onClick={() => setsettedScale(p => p - 0.5)}>-</div>
      </div>
    </>
  );
};

export default PdfUrlViewer;
