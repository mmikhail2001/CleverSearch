import React, { FC, useEffect, useRef, useState } from 'react';
import { PopoverOrigin } from '@mui/material'
import { Popover as UIPopover } from '@mui/material'
import { isNullOrUndefined } from '@helpers/isNullOrUndefined';
import CSS from 'csstype'

export type WhereToPlace = 'up' | 'down'
export type WhatCorner = 'left' | 'right'

const getOrigins = (variant: WhereToPlace, whatCorner: WhatCorner ): PopoverOrigin[] => {
    let transformOrigin: PopoverOrigin
    let anchorOrigin: PopoverOrigin

    // Tranform playground
    //https://mui.com/material-ui/react-popover/#anchor-playground
    switch (variant) {
        case 'up':
            anchorOrigin = {
                vertical: 'top',
                horizontal: 'right',

            }
            transformOrigin = {
                vertical: 'bottom',
                horizontal: 'right',

            }
            break;
        case 'down':
        default:
            anchorOrigin = {
                vertical: 'bottom',
                horizontal: 'left',

            }
            transformOrigin = {
                vertical: 'top',
                horizontal: 'left',
            }

    }
    return [transformOrigin, anchorOrigin]
}

interface PopOverProps {
    styleMain?: CSS.Properties,
    children: React.ReactNode[],
    whatCorner?: WhatCorner,
    mainElement: React.ReactNode,
    variants?: WhereToPlace,
    isCloseOnSelect?: boolean,
    open: boolean;
    toggleOpen: (state: boolean) => void;
    // left-top right-top left-bottom right-bottom
    marginTop?: string,
    background: string,
}

export const PopOver: FC<PopOverProps> = ({
    children,
    mainElement,
    variants,
    isCloseOnSelect,
    open,
    toggleOpen,
    styleMain,
    marginTop,
    whatCorner,
    background,
}) => {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const ref = useRef<HTMLDivElement>(null)

    const handleClick = () => {
        toggleOpen(true)
    };

    const handleClose = () => {
        toggleOpen(false)
    };

    if (isNullOrUndefined(whatCorner)) {
        whatCorner = 'right'
    }
    
    let [transformOrigin, anchorOrigin] = getOrigins(variants, whatCorner)

    useEffect(() => {
        if (ref) {
            setAnchorEl(ref.current)
        }
    }, [ref])

    const isNeedCloseOnSelect = isNullOrUndefined(isCloseOnSelect) || isCloseOnSelect

    return (
        <>
            <div onClick={handleClick} ref={ref} style={{ width: 'fit-content', ...styleMain }}>{mainElement}</div>
            <UIPopover
                sx={{
                    marginTop: marginTop, 
                    '& > div': {
                        backgroundColor: 'transparent',
                        borderRadius: 'var(--big-radius)',
                        boxShadow:'3px 3px 10px 4px rgba(0,0,0,0.1)',
                        color:'inherit',
                    }}
                }
                disableAutoFocus
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                transformOrigin={transformOrigin}
                anchorOrigin={anchorOrigin}
            >
                {
                    children.map(
                        child => <div key={child.toString().slice(-5, -9)} onClick={isNeedCloseOnSelect ? handleClose : null}>
                            {child}
                        </div>
                    )
                }
            </UIPopover >
        </>
    );
};
