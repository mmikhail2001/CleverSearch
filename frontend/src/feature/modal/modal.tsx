import React, { FC } from 'react';
import './modal.scss'
import { DialogActions, DialogContent, Dialog as UIDialog } from '@mui/material'

interface ModalProps {
    isOpen: boolean;
    closeModal: () => void;
    children: React.ReactNode;
    className?: string;
    bodyClassName?: string;
    bottomFrame?: React.ReactNode;
    isFullscreen?: boolean;
    isFullWidth?: boolean;
}

export const Modal: FC<ModalProps> = ({
    isOpen,
    closeModal,
    children,
    className,
    bodyClassName,
    bottomFrame,
    isFullscreen,
    isFullWidth,
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
            fullWidth={isFullWidth}
            scroll='paper'
            fullScreen={isFullscreen}
            className={className}
        >
            <DialogContent>
                {children}
            </DialogContent>
            {bottomFrame ?
                <DialogActions className={bodyClassName} onClick={(e) => e.preventDefault()}>
                    {bottomFrame}
                </DialogActions>
                :
                null
            }
        </UIDialog>
    )
};