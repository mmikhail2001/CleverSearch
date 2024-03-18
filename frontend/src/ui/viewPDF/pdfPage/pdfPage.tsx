import { PDFPageProxy } from 'pdfjs-dist';
import React, { FC, ReactElement, useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

interface PdfPageProps {
    pageNumber: number;
    page: PDFPageProxy
}

export const PdfPage: FC<PdfPageProps> = ({
    pageNumber,
    page
}) => {
    const pageRef = useRef<HTMLCanvasElement>(null);
    const textLayerRef = useRef(null);

    if (pageRef.current) {
        let scale = 1.5;
        let viewport = page.getViewport({ scale: scale, });
        let outputScale = window.devicePixelRatio || 1;

        let context = pageRef.current.getContext('2d') as CanvasRenderingContext2D;

        pageRef.current.width = Math.floor(viewport.width * outputScale);
        pageRef.current.height = Math.floor(viewport.height * outputScale);
        pageRef.current.style.width = Math.floor(viewport.width) + "px";
        pageRef.current.style.height = Math.floor(viewport.height) + "px";

        let transform = outputScale !== 1
            ? [outputScale, 0, 0, outputScale, 0, 0]
            : undefined as any[] | undefined;

        let renderContext = {
            canvasContext: context,
            transform: transform,
            viewport: viewport
        };

        page.render(renderContext);
        page.getTextContent().then(textContent => {
            if (!textLayerRef.current) {
                return;
            }

            pdfjsLib.renderTextLayer({
                textContentSource: textContent,
                container: textLayerRef.current,
                viewport: viewport
            })
        })
    }

    return (
        <div aria-label={String(pageNumber)}>
            <canvas ref={pageRef}></canvas>
            <div ref={textLayerRef} className="PdfPage__textLayer" />
        </div>
    )
};
