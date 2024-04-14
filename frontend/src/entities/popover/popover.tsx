import React, { FC, useEffect, useRef } from 'react';
import { PopoverOrigin } from '@mui/material'
import { Popover as UIPopover } from '@mui/material'
import { isNullOrUndefined } from '@helpers/isNullOrUndefined';

export type WhereToPlace = 'up' | 'down'

interface PopOverProps {
    children: React.ReactNode[]
    mainElement: React.ReactNode,
    variants?: WhereToPlace,
    isCloseOnSelect?: boolean,
    open: boolean;
    toggleOpen: (state: boolean) => void;
    // left-top right-top left-bottom right-bottom
}

export const PopOver: FC<PopOverProps> = ({
    children,
    mainElement,
    variants,
    isCloseOnSelect,
    open,
    toggleOpen,
}) => {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const ref = useRef<HTMLDivElement>(null)

    const handleClick = () => {
        toggleOpen(true)
    };

    const handleClose = () => {
        toggleOpen(false)
    };

    let transformOrigin: PopoverOrigin
    let anchorOrigin: PopoverOrigin

    // Tranform playground
    //https://mui.com/material-ui/react-popover/#anchor-playground
    switch (variants) {
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
                horizontal: 'right',

            }
            transformOrigin = {
                vertical: 'top',
                horizontal: 'right',
            }

    }

    useEffect(() => {
        if (ref) {
            setAnchorEl(ref.current)
        }
    }, [ref])

    const isNeedCloseOnSelect = isNullOrUndefined(isCloseOnSelect) || isCloseOnSelect

    return (
        <>
            <div onClick={handleClick} ref={ref} style={{ width: 'fit-content' }}>{mainElement}</div>
            <UIPopover
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
