import * as pdfjs from 'pdfjs-dist';
import { DocumentInitParameters, PDFDocumentLoadingTask, PDFDocumentProxy } from 'pdfjs-dist/types/src/display/api';
import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import { VariableSizeList } from 'react-window';
import PdfViewer from './pdfViewerOriginal';
import { Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

export interface PdfUrlViewerProps {
  url: string,
  page: number,
  authToken?: string,
}

const PdfUrlViewer: FC<PdfUrlViewerProps> = ({ url, authToken, page }) => {
  const pdfRef = useRef<PDFDocumentProxy>();
  const windowRef = useRef<VariableSizeList>(null)
  const [itemCount, setItemCount] = useState(0);
  const [isFirstPageLoaded, setFirstPageLoaded] = useState(false);
  const [settedScale, setsettedScale] = useState(1);

  const scrollToItem = () => {
    windowRef?.current && windowRef.current.scrollToItem(page - 1, 'start');
  };

  useEffect(() => {
    let loadingTask: PDFDocumentLoadingTask;

    if (authToken !== '' || authToken !== null) {
      const docInitParams = new Object() as DocumentInitParameters;
      docInitParams.url = url;
      docInitParams.httpHeaders = { 'Authorization': `Bearer ${authToken}` };

      loadingTask = pdfjs.getDocument(docInitParams);
    } else {
      loadingTask = pdfjs.getDocument(url);
    }

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
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography fontSize={'var(--ft-body)'}>Scale</Typography>
        <div style={{
          display: 'flex',
          fontSize: 'calc(var(--ft-body) - 0.3rem)',
          alignItems: 'center',
        }}>
          <RemoveIcon
            style={{ background: 'var(--main-color-100)', borderRadius: 'var(--small-radius)' }}
            fontSize='inherit'
            onClick={() => setsettedScale(p => p - 0.25)}
          />
          <Typography fontSize={'var(--ft-body)'}>{settedScale}</Typography>
          <AddIcon
            style={{ background: 'var(--main-color-100)', borderRadius: 'var(--small-radius)' }}
            fontSize='inherit'
            onClick={() => setsettedScale(p => p + 0.25)}
          />
        </div>
      </div>
    </>
  );
};

export default PdfUrlViewer;
