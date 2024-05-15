import React, { FC } from 'react';
import './modal.scss'
import { DialogActions, DialogContent, Dialog as UIDialog } from '@mui/material'
import CSS from 'csstype'

interface ModalProps {
    isOpen: boolean;
    closeModal: () => void;
    children: React.ReactNode;
    className?: string;
    bodyClassName?: string;
    bottomFrame?: React.ReactNode;
    isFullscreen?: boolean;
    isFullWidth?: boolean;
    stylesOnContentBackground?: CSS.Properties;
    styleOnModal?: CSS.Properties;
    backgroundStyle?: 'black',
    isFullHeight?: boolean,
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
    stylesOnContentBackground,
    styleOnModal,
    backgroundStyle,
    isFullHeight,
}) => {
    const handleClose = (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();
        closeModal();
    }

    let setBackground;
    switch (backgroundStyle) {
        case 'black':
        default:
            setBackground = 'rgba(0,0,0,0.6)'
    }

    return (
        <UIDialog
            disableAutoFocus
            disableEnforceFocus
            open={isOpen}
            sx={{
                background: setBackground, 
                '& .MuiDialog-container': {
                    alignItems: isFullHeight ? 'flex-start': null,
                }
            }}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
            maxWidth={'lg'}
            fullWidth={isFullWidth}
            scroll='paper'
            fullScreen={isFullscreen}
            className={className}
            PaperProps={{style:{...styleOnModal, maxHeight: '100%', margin: '0px'}}}
        >
            <DialogContent sx={{...stylesOnContentBackground}}>
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