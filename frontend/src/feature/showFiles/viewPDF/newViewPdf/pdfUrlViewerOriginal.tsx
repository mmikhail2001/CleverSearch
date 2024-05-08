import * as pdfjs from 'pdfjs-dist';
import { DocumentInitParameters, PDFDocumentLoadingTask, PDFDocumentProxy } from 'pdfjs-dist/types/src/display/api';
import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import { VariableSizeList } from 'react-window';
import PdfViewer from './pdfViewerOriginal';
import { IconButton, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

import AddRoundedIcon from '@mui/icons-material/AddRounded';
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded';


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
  }, [isFirstPageLoaded])

  return (
    <div className='pdf-with-controls'>
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
        <div style={{
          display: 'flex',
          fontSize: 'calc(var(--ft-body) - 0.3rem)',
          alignItems: 'center',
        }}>
          {controls(
            () => setsettedScale(p => p + 0.25),
            () => setsettedScale(p => p - 0.25),
            settedScale
          )}
        </div>
      </div>
    </div>
  );
};

const controls = (zoomOut: () => void, zoomIn: ()=>void, scale: number) => {
	return (
		<div className="modal-scale">
			<IconButton 
				onClick={() => zoomOut()}
				sx={{color:'inherit'}}
			>
				<AddRoundedIcon sx={{color:'inherit'}} />
			</IconButton>
      <Typography fontSize={'var(--ft-body)'}>{scale}</Typography>
			<IconButton 
				onClick={() => zoomIn()}
				sx={{color:'inherit'}}
			>
				<RemoveRoundedIcon sx={{color:'inherit !'}} />
			</IconButton>
		</div>
	)
}


export default PdfUrlViewer;
