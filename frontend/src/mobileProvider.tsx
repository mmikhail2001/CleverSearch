import { useProfileQuery } from '@api/userApi';
import { SerializedError } from '@reduxjs/toolkit';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { useAppSelector } from '@store/store';
import { login as loginAction, logout as logoutAction, setUserEmail } from '@store/userAuth';
import React, { FC } from 'react';
import { useDispatch } from 'react-redux';
import { Navigate, useLocation } from 'react-router';

// WhatDisplay show what display is now like
// 1 -- PC
// 2 -- Mobile
// 3 -- Tablet
export interface MobileContextType {
    whatDisplay: number,
    currentWidth: number,
    currentHeight: number,
}

const MobileContext = React.createContext<MobileContextType>(null!);

export const MobileProvider: FC<{ children: React.ReactNode }> = ({ children }) => {
    const [screenDimensions, setScreenDimensions] = React.useState({
        width: window.screen.width,
        height: window.screen.height
    });

    const getScreenDimensions = () => {
        const width = window.innerWidth;
        const height = window.innerHeight;

        setScreenDimensions({ width, height });
    };

    React.useEffect(() => {
        window.addEventListener("resize", getScreenDimensions);

        return () => {
            window.removeEventListener("resize", getScreenDimensions);
        };
    });

    const passedContext = {
        currentWidth: screenDimensions.width,
        currentHeight: screenDimensions.height,
        whatDisplay: screenDimensions.width >= 1000 ? 1 : 2
    } as MobileContextType;

    return <MobileContext.Provider value={passedContext}>{children}</MobileContext.Provider>;
};

export function useMobile(): MobileContextType {
    return React.useContext(MobileContext);
}