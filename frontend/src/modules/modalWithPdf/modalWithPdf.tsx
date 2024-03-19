import React, { FC, useEffect, useRef } from 'react';
import { Modal } from '@ui/modal/modal';
import { ViewPDF } from '@ui/viewPDF/viewPDF';
import './ModalWithPDF.scss'

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
    return (
        <div>
            <Modal className={'modal__pdf-show'} isOpen={isOpen} closeModal={close}>
                <ViewPDF pdfURL={pdfURL} openPageInPDF={pageNumber} searchString={searchString}></ViewPDF>
            </Modal>
        </div >
    );
};