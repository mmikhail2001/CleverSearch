import React, { FC } from 'react';
import './breadCrumps.scss';
import { Button } from '@entities/button/button';
import { Breadcrumbs, Typography } from '@mui/material';

interface VoidFunc {
    (): void
}

export interface BreadCrumpsProps {
    dirs: string[];
    // Reactions on all breadcrumps
    reactOnElements?: VoidFunc[]
}

export const BreadCrumps: FC<BreadCrumpsProps> = ({ dirs, reactOnElements }) => {
    return <div className='bread-crumbs-container'>
        <Breadcrumbs
            separator={<Typography sx={{color:'inherit'}} fontSize={'var(--ft-pg-24)'}>/</Typography>}
            sx={{
                    color:'inherit'
            }}
        >
            {
                dirs.map((value, index) => {
                    if (value === '') return null

                    return <Typography
                        fontSize={'var(--ft-pg-24)'}
                        className={dirs.length !== index + 1 ? 'breadcrump-element': ''}
                        sx={{
                            cursor: dirs.length !== index + 1 ? 'pointer' : 'default',
                            color: 'inherit',
                            marginRight: index === 0 ? '8px' : null,
                            paddingRight: '4px',
                            paddingLeft: '4px',
                            fontWeight: index === 0 ? '600' : null,
                        }}
                        key={value}
                        onClick={reactOnElements ? reactOnElements[index] : () => { }}
                    >
                        {value}
                    </Typography>
                })
            }
        </Breadcrumbs >
    </div>
}