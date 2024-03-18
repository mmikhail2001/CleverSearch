import CSS from 'csstype';
import { PDFPageProxy } from "pdfjs-dist";
import React, { FC, useCallback, useEffect, useRef, useState } from "react";
import { VariableSizeList } from "react-window";
import useResizeObserver from "use-resize-observer";
import Page from "./Page";
import PdfPage from "./PdfPage";

export interface PdfViewerProps {
  itemCount: number,
  getPdfPage: (index: number) => Promise<PDFPageProxy> | undefined,
  scale: number,
  gap: number,
  windowRef: React.MutableRefObject<VariableSizeList>,
  onLoad: () => void
}


const PdfViewer: FC<PdfViewerProps> = ({
  itemCount,
  getPdfPage,
  scale,
  gap,
  windowRef,
  onLoad,
}) => {
  const [pages, setPages] = useState([] as PDFPageProxy[]);
  const listRef = useRef<VariableSizeList>();

  const {
    ref,
    width: internalWidth = 400,
    height: internalHeight = 600
  } = useResizeObserver();

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
          listRef.current.resetAfterIndex(index);
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
    (elem: React.MutableRefObject<VariableSizeList>) => {
      listRef.current = elem;
      if (windowRef) {
        windowRef.current = elem;
      }
    },
    [windowRef]
  );

  useEffect(() => {
    listRef.current.resetAfterIndex(0);
  }, [scale]);

  // TODO replace with class
  const style = {
    width: '100%',
    height: '100%',
    border: "1px solid #ccc",
    background: "#ddd"
  };

  return (
    <div className="pdf-viewer" ref={ref} style={style}>
      <VariableSizeList
        ref={handleListRef}
        width={internalWidth}
        height={internalHeight}
        itemCount={itemCount}
        itemSize={handleItemSize}
      >
        {({ index, style }: { index: number, style: CSS.Properties }) => {
          fetchPage(index);
          return (
            <Page style={style}>
              <PdfPage page={pages[index]} scale={scale} />
            </Page>
          );
        }}
      </VariableSizeList>
    </div>
  );
};

export default PdfViewer;
