import React, { FC, useEffect, useRef } from 'react';
import './modal.scss'
import { Button } from '@entities/button/button';
import { DialogActions, DialogContent, Dialog as UIDialog } from '@mui/material'

interface ModalProps {
    isOpen: boolean;
    closeModal: () => void;
    children: React.ReactNode;
    className: string;
    bodyClassName?: string;
    bottomFrame?: React.ReactNode;
    isFullscreen?: boolean;
}

export const Modal: FC<ModalProps> = ({
    isOpen,
    closeModal,
    children,
    className,
    bodyClassName,
    bottomFrame,
    isFullscreen,
}) => {
    const handleClose = (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();
        closeModal();
    }

    return (
        <UIDialog
            open={isOpen}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
            maxWidth={'lg'}
            fullWidth={true}
            scroll='paper'
            fullScreen={isFullscreen}
        >
            <DialogContent>
                {children}
            </DialogContent>
            {bottomFrame ?
                <DialogActions onClick={(e) => e.preventDefault()}>
                    {bottomFrame}
                </DialogActions>
                :
                null
            }
        </UIDialog>
    )
};