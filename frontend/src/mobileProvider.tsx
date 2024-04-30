import React, { FC } from 'react';

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
        width: window.innerWidth,
        height: window.innerHeight
    });

    const getScreenDimensions = () => {
        const width = window.innerWidth;
        const height = window.innerHeight;

        setScreenDimensions({ width, height });
    };

    React.useEffect(() => {
        window.addEventListener('resize', getScreenDimensions);

        return () => {
            window.removeEventListener('resize', getScreenDimensions);
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