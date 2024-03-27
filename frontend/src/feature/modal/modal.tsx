import React, { FC, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import './modal.scss'
import { Button } from '@entities/button/button';

interface ModalProps {
    isOpen: boolean;
    closeModal: () => void;
    children: React.ReactNode;
    className: string;
    bodyClassName?: string
}

export const Modal: FC<ModalProps> = ({
    isOpen,
    closeModal,
    children,
    className,
    bodyClassName,
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
            if (ref.current && (ref.current === event.target
                || !ref.current.contains(event.target as Node & EventTarget))
            ) {
                closeModal()
            }
        }
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [ref]);

    useEffect(() => {
        function handleEsc(event: KeyboardEvent) {
            if (event.key.toLowerCase() === 'escape') {
                closeModal()
            }
        }
        document.addEventListener('keydown', handleEsc);

        return () => {
            document.removeEventListener('keydown', handleEsc);
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
                <div className={['modal-body', bodyClassName].join(' ')} onClick={(event) => event.stopPropagation()}>
                    {children}
                    {/* TODO remove classname and set another */}
                    <Button clickHandler={closeModal} buttonText={'Закрыть'} variant={'filled'} className='pdf-viewer'></Button>
                </div>
                : null}
        </dialog>,
        document.body
    )
};