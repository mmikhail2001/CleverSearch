import React, { FC } from 'react';
import { Drawer as UIDrawer, createTheme } from '@mui/material'
import { isNullOrUndefined } from '@helpers/isNullOrUndefined';
interface DrawerProps {
    children: React.ReactNode;
    open: boolean;
    toggleDrawer: (state: boolean) => void;
    isPermanent: boolean;
    width: string;
    background?: "transparent" | 'default' | string,
    borderRight?: string,
}

export const Drawer: FC<DrawerProps> = ({
    children,
    open,
    toggleDrawer,
    isPermanent,
    width,
    background,
    borderRight,
}) => {
    const handleClose = (): void => {
        toggleDrawer(false)
    }

    if (isNullOrUndefined(background)) background = 'default'
    let setBackground;
    switch(background) {
        case 'default':
            setBackground = 'linear-gradient(to bottom, #11344E, #700F49)'
            break;
        case 'transparent':
            setBackground = 'transparent'
            break;
        default: 
        setBackground = background
    }

    return (
        <UIDrawer
            sx={{ "& .MuiDrawer-paper": { 
                borderWidth: 0, 
                borderRight: borderRight,
                background: setBackground,
                color: 'inherit',
            } }}
            PaperProps={{style:{width: width}}}
            open={open}
            onClose={handleClose}
            variant={isPermanent ? 'permanent' : 'temporary'}
        >
            {children}
        </UIDrawer>
    );
};
