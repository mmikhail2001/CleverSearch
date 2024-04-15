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
    // Reaction on button on all breadcrumps, like back
    onClick: () => void
}

export const BreadCrumps: FC<BreadCrumpsProps> = ({ dirs, reactOnElements, onClick }) => {
    return <>
        <Breadcrumbs
            separator={<Typography fontSize={'var(--ft-body)'}>/</Typography>}
        >
            {
                dirs.map((value, index) => {
                    if (value === '') return null

                    return <Typography
                        fontSize={'var(--ft-body)'}
                        sx={{cursor: dirs.length !== index + 1 ? 'pointer' : 'default'}}
                        key={value}
                        onClick={reactOnElements ? reactOnElements[index] : () => { }}
                    >
                        {value}
                    </Typography>
                })
            }
        </Breadcrumbs >
        <Button
            fontSize={'var(--ft-body)'}
            buttonText={'Назад'}
            clickHandler={onClick}
            variant={'text'}
            disabled={dirs.length <= 1}
        />
    </>
}