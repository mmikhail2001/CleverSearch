import React, { FC, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import './modal.scss'
import { Button } from '@entities/button/Button';

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
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [ref]);


    return ReactDOM.createPortal(
        <dialog
            // TODO Try without none and check if closeModal is called
            style={isOpen ? {} : { display: 'none' }}
            ref={ref}
            aria-modal="true"
            aria-labelledby='dialog-title'
            className={className + ' ' + 'modal-dialog'}
        >
            {isOpen ?
                <div className='modal-body' onClick={(event) => event.stopPropagation()}>
                    {children}
                    {/* TODO remove classname and set another */}
                    <Button clickHandler={closeModal} buttonText={'Закрыть'} variant={'filled'} className='pdf-viewer'></Button>
                </div>
                : null}
        </dialog>,
        document.body
    )
};