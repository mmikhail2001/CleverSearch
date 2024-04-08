import React, { FC } from 'react';
import './breadCrumps.scss';
import { Button } from '@entities/button/button';
import { Breadcrumbs, Typography } from '@mui/material';

interface VoidFunc {
    (): void
}

export interface BreadCrumpsProps {
    dirs: string[];
    reactOnElements?: VoidFunc[]
    onClick: () => void
}

export const BreadCrumps: FC<BreadCrumpsProps> = ({ dirs, reactOnElements, onClick }) => {
    // TODO подумать над тем, чтобы внедрить тут работу над ссылками, не onclick
    return <>
        <Breadcrumbs
            separator={<Typography fontSize={'var(--ft-small-text)'}>/</Typography>}
        >
            {
                dirs.map((value, index) => {
                    if (value === '') return null

                    return <Typography
                        fontSize={'var(--ft-small-text)'}
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