import React, { FC, useEffect, useRef } from 'react';
import Snackbar from '@mui/material/Snackbar';


interface NotificationBarProps {
    children: React.ReactNode,
    isOpen: boolean,
    setOpen: (state: boolean) => void,
    autoHideDuration?: number;
    className?: string;
}

export const NotificationBar: FC<NotificationBarProps> = ({
    children,
    isOpen,
    setOpen,
    autoHideDuration,
    className,
}) => {
    return (
        <Snackbar
            open={isOpen}
            autoHideDuration={autoHideDuration}
            onClose={() => setOpen(false)}
        >
            <div className={className}>
                {children}
            </div>
        </Snackbar>
    )
};
