import React, { FC, useEffect, useRef } from 'react';
import { Button } from '@ui/button/Button';
import { Modal } from '@ui/modal/modal';
import { ViewPDF } from '@ui/viewPDF/viewPDF';

interface ModalWithPDFProps {
    isOpen: boolean;
    close: () => void;
    pdfURL: string;
    pageNumber?: number;
    searchString?: string;
}

export const ModalWithPDF: FC<ModalWithPDFProps> = ({
    isOpen,
    close,
    pdfURL,
    pageNumber,
    searchString,
}) => {

    const ref = useRef<HTMLDivElement>()

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (ref.current && !ref.current.contains(event.target as Node & EventTarget)) {
                close()
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [ref]);

    return (
        <div ref={ref}>
            <Modal isOpen={isOpen} closeModal={close} >
                <ViewPDF isVisible={isOpen} pdfURL={pdfURL} openPageInPDF={pageNumber} searchString={searchString}></ViewPDF>
            </Modal>
        </div>
    );
};