import * as pdfjs from 'pdfjs-dist';
import React, { FC, useEffect, useRef } from 'react';
import './pdfPage.scss';

export interface PdfPageProps {
  page: pdfjs.PDFPageProxy,
  scale: number,
}

const PdfPage: FC<PdfPageProps> = React.memo(function pdfPage({ page, scale }: PdfPageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textLayerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!page) {
      return;
    }
    const viewport = page.getViewport({ scale });

    // Prepare canvas using PDF page dimensions
    const canvas = canvasRef.current;
    if (canvas) {
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      // Render PDF page into canvas context
      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };
      const renderTask = page.render(renderContext);
      renderTask.promise.then(function () {
      });

      page.getTextContent().then(textContent => {
        if (!textLayerRef.current) {
          return;
        }

        // Pass the data to the method for rendering of text over the pdf canvas.
        pdfjs.renderTextLayer({
          textContentSource: textContent,
          container: textLayerRef.current,
          viewport: viewport,
          textDivs: []
        });
      });
    }
  }, [page, scale]);

  const root = document.documentElement
  root.style.setProperty('--scale-factor', String(scale))

  return (
    <div className="PdfPage">
      <canvas ref={canvasRef} />
      <div ref={textLayerRef} className='textLayer'/> {/* className="PdfPage__textLayer" /> */}
      <div>{page?._pageIndex}</div>
    </div>
  );
});

export default PdfPage;
