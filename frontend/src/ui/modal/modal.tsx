import React, { FC, ReactElement, useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import './modal.scss'

interface ModalProps {
    isOpen: boolean;
    closeModal: () => void;
    children: React.ReactNode;
    className: string;
}

export const Modal: FC<ModalProps> = ({
    isOpen,
    closeModal,
    children,
    className,
}) => {
    const ref = useRef<HTMLDialogElement>(null)
    useEffect(() => {
        if (isOpen) {
            ref.current?.showModal();
        } else {
            ref.current?.close();
        }
    }, [isOpen]);


    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (ref.current && (ref.current === event.target || !ref.current.contains(event.target as Node & EventTarget))) {
                closeModal()
            }
        }
        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [ref]);


    return ReactDOM.createPortal(
        <dialog
            style={isOpen ? {} : { display: 'none' }}
            ref={ref}
            aria-modal="true"
            aria-labelledby='dialog-title'
            className={className + ' ' + 'modal-dialog'}
        >
            {isOpen ?
                <div className='modal-body'>
                    {children}
                    {/* TODO remove classname and set another */}
                    <button onClick={closeModal} className='pdf-viewer'>Close</button>
                </div>
                : null}
        </dialog>,
        document.body
    )
};