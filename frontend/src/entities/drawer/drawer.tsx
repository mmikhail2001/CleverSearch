import React, { FC } from 'react';
import { Drawer as UIDrawer } from '@mui/material'
interface DrawerProps {
    children: React.ReactNode;
    open: boolean;
    toggleDrawer: (state: boolean) => void;
    isPermanent: boolean;
    width: string;
}

export const Drawer: FC<DrawerProps> = ({
    children,
    open,
    toggleDrawer,
    isPermanent,
    width
}) => {
    const handleClose = (): void => {
        toggleDrawer(false)
    }

    return (
        <UIDrawer
            sx={{ width: width }}
            open={open}
            onClose={handleClose}
            variant={isPermanent ? 'permanent' : 'persistent'}
        >
            {children}
        </UIDrawer>
    );
};
