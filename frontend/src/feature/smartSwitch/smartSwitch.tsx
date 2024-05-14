import React, { FC } from 'react';
import {Tooltip, Typography, Dialog as UIDialog } from '@mui/material'
import { Switch } from '@entities/switch/switch';

import './smartSwitch.scss'

interface SmartSwitchProps {
    isSmartSearch: boolean,
    changeSmartSearch: () => void,
}

const tooltipSmartText = 'Smart search enables matching within files, not just their titles. It can recognize text within images, videos, and audio. Moreover, it searches by meaning rather than exact matches'

export const SmartSwitch: FC<SmartSwitchProps> = ({
    isSmartSearch,
    changeSmartSearch,
}) => {
    const handleChange = () => {
        changeSmartSearch()
    }
    return (
        <Tooltip
            slotProps={{tooltip:{style:{
                    fontSize: 'var(--ft-small-text)',
                    background: 'rgba(79,79,79,0.2)',
                    backdropFilter: 'blur(12px)',
                    color: 'rgba(255,255,255,0.9)',
                    padding: 'var(--big-padding)',
                }}
            }}
            title={tooltipSmartText}
        >
            <div className={['smart-switch', isSmartSearch ? '' : 'not-selected-smart'].join(' ')}>
                <Typography fontSize={'var(--ft-paragraph)'}>Smart</Typography>
                <Switch
                    size={'small'} 
                    checked={isSmartSearch}
                    onChange={handleChange}
                ></Switch>
            </div>
        </Tooltip>
    )
};