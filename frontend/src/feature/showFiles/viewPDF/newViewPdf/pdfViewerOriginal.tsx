import { PDFPageProxy } from 'pdfjs-dist';
import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import { ListChildComponentProps, VariableSizeList } from 'react-window';
import useResizeObserver from 'use-resize-observer';
import Page from './page/pageWrapper';
import PdfPage from './page/pageOfPPdf';
import { CircularProgress } from '@mui/material';
import { isNullOrUndefined } from '@helpers/isNullOrUndefined';

export interface PdfViewerProps {
  itemCount: number,
  getPdfPage: (index: number) => Promise<PDFPageProxy> | undefined,
  scale: number,
  gap: number,
  windowRef: React.MutableRefObject<VariableSizeList>,
  onLoad: () => void,
  scrollPage: (page:number) => void,
}

const PdfViewer: FC<PdfViewerProps> = ({
  itemCount,
  getPdfPage,
  scale,
  gap,
  windowRef,
  onLoad,
  scrollPage,
}) => {
  const [pages, setPages] = useState([] as PDFPageProxy[]);
  const listRef = useRef<VariableSizeList>();
  
  const {
    ref,
    width: internalWidth = 400,
    height: internalHeight = 900
  } = useResizeObserver();
  
  const [widthToSet, setWidthToSet] = useState(internalWidth)

  useEffect(() => {
    const maxWidth = pages.reduce((prev, current) => {
      let currentWidth = current?.getViewport()?.viewBox[2]
      return currentWidth > prev ? currentWidth : prev
    },0)

    if (widthToSet !== maxWidth)
      setWidthToSet(maxWidth)
  }, [pages])

  const fetchPage = useCallback(
    (index: number) => {
      if (!pages[index]) {
        getPdfPage(index)?.then((page: PDFPageProxy) => {
          onLoad()
          setPages(prev => {
            const next = [...prev];
            next[index] = page;
            return next;
          });
          listRef?.current?.resetAfterIndex(index);
        });
      }
    },
    [getPdfPage, pages]
  );

  const handleItemSize = useCallback(
    (index: number) => {
      const page = pages[index];
      if (page) {
        const viewport = page.getViewport({ scale });
        return viewport.height + gap;
      }
      return 50;
    },
    [pages, scale, gap]
  );

  const handleListRef = useCallback(
    (elem: VariableSizeList<any>) => {
      listRef.current = elem;
      if (windowRef) {
        windowRef.current = elem;
      }
    },
    [windowRef]
  );

  useEffect(() => {
    listRef?.current?.resetAfterIndex(0);
  }, [scale]);

  const style = {
    width: `100%`,
    minWidth: '300px',
    height: '100%',
  };

  const renderPage: FC<ListChildComponentProps> = ({ index, style }) => {
    fetchPage(index);
    return (
      // @ts-expect-error HACK
      <Page style={{...style, width:`fit-content`}}>
        {!isNullOrUndefined(pages[index]) ? <PdfPage page={pages[index]} scale={scale} /> : <CircularProgress />}
      </Page>
    );
  }

  const settedWidth = widthToSet * scale + 20 < 330 ? `330px` : `calc(calc(${widthToSet}px * var(--scale-factor)) + ${30}px)`

  return (
    <div className="pdf-viewer" ref={ref} style={{...style, width: "fit-content", maxWidth: '100%'}}>
      <VariableSizeList
        ref={handleListRef}
        width={settedWidth}
        height={internalHeight}
        itemCount={itemCount}
        itemSize={handleItemSize}
        className='pdf-list-page'
        onItemsRendered={(props) => {
          const stopPage = Number(props.visibleStopIndex)
          if (!Number.isNaN(stopPage)) {
            scrollPage(stopPage + 1)
          }
        }}

      >
        {renderPage}
      </VariableSizeList>
    </div>
  );
};

export default PdfViewer;
