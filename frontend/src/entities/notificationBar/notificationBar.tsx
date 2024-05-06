import React, { FC, useEffect, useState } from 'react';
import Snackbar from '@mui/material/Snackbar';
import { isNullOrUndefined } from '@helpers/isNullOrUndefined';


interface NotificationBarProps {
    children: React.ReactNode,
    isOpen?: boolean,
    setOpen?: (state: boolean) => void,
    autoHideDuration?: number;
    className?: string;
    variant?: 'bad' | 'good' | 'neutral',
    onClose?: () => void,
}

export const NotificationBar: FC<NotificationBarProps> = ({
    children,
    isOpen,
    setOpen,
    autoHideDuration,
    className,
    variant,
    onClose,
}) => {
    const [openState, setOpenState] = useState(false)
    const [controllable, setControllable] = useState(true)
    
    const onCloseHandler = () => {
        if (controllable) {
            setOpen(false)
        } else {
            setOpenState(false)
        }
        onClose()
    }

    useEffect(() => {
        if (isNullOrUndefined(isOpen)) {
            setControllable(false)
            if (!isNullOrUndefined(autoHideDuration)) {
                setOpenState(true)
            }
        }
    }, [])

    let textColor;
    
    if (isNullOrUndefined(variant)) variant = 'neutral'
    switch (variant) {
        case 'bad':
            textColor = '#D56C6E';
            break;
        case 'good':
            textColor = '#59C454'
        case 'neutral':
            textColor = 'inherit'
    }

    return (
        <Snackbar
            open={controllable ? isOpen : openState}
            autoHideDuration={autoHideDuration}
            onClose={onCloseHandler}
        >
            <div className={className} style={{
                color: textColor
            }}>
                {children}
            </div>
        </Snackbar>
    )
};
