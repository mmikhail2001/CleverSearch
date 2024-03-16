import React, { FC, ReactElement, useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';

interface ModalProps {
    isOpen: boolean;
    closeModal: () => void;
    children: React.ReactNode
}

export const Modal: FC<ModalProps> = ({
    isOpen,
    closeModal,
    children,
}) => {
    const ref = useRef<HTMLDialogElement>();

    useEffect(() => {
        if (isOpen) {
            ref.current?.showModal();
        } else {
            ref.current?.close();
        }
    }, [isOpen]);

    return ReactDOM.createPortal(
        <dialog
            ref={ref}
            aria-modal="true"
            aria-labelledby='dialog-title'
            className='modal-dialog'
        >
            <div className='modal-body'>{children}</div>
            <button onClick={closeModal}>Close</button>
        </dialog>,
        document.body
    )
};