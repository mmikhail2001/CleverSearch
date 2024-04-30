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
            sx={{color:'inherit'}}
            separator={<Typography sx={{color:'inherit'}} fontSize={'var(--ft-pg-24)'}>/</Typography>}
        >
            {
                dirs.map((value, index) => {
                    if (value === '') return null

                    return <Typography
                        fontSize={'var(--ft-pg-24)'}
                        sx={{
                            cursor: dirs.length !== index + 1 ? 'pointer' : 'default',
                            color: 'inherit',
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