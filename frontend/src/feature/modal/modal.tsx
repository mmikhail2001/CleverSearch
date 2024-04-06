import React, { FC, useEffect, useRef } from 'react';
import './modal.scss'
import { Button } from '@entities/button/button';
import { DialogActions, DialogContent, Dialog as UIDialog } from '@mui/material'

interface ModalProps {
    isOpen: boolean;
    closeModal: () => void;
    children: React.ReactNode;
    className: string;
    bodyClassName?: string
    bottomFrame?: React.ReactNode
}

export const Modal: FC<ModalProps> = ({
    isOpen,
    closeModal,
    children,
    className,
    bodyClassName,
    bottomFrame
}) => {
    return (
        <UIDialog
            open={isOpen}
            onClose={closeModal}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
            maxWidth={'lg'}
            fullWidth={true}
            scroll='paper'
        >
            <DialogContent>
                {children}
            </DialogContent>
            {bottomFrame ?
                <DialogActions>
                    {bottomFrame}
                </DialogActions>
                :
                null
            }
        </UIDialog>
    )
};