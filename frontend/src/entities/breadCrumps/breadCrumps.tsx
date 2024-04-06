import React, { FC } from 'react';
import './breadCrumps.scss';
import { Button } from '@entities/button/button';
import { Breadcrumbs } from '@mui/material';

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
        <Breadcrumbs>
            {dirs.map((value, index) => {
                if (value === '') return null

                return <p
                    key={value}
                    onClick={reactOnElements ? reactOnElements[index] : () => { }}>
                    {index === 0 ? value : `/${value}`}
                </p>
            })}
        </Breadcrumbs>
        {/* <div className='bread-crumps'>
            {dirs.map((value, index) => {
                if (value === '') return null

                return <p
                    key={value}
                    onClick={reactOnElements ? reactOnElements[index] : () => { }}>
                    {index === 0 ? value : `/${value}`}
                </p>
            })}
        </div> */}
        <Button
            buttonText={'Назад'}
            clickHandler={onClick}
            variant={'text'}
            disabled={dirs.length <= 1}
        />
    </>
}