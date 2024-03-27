import React, { FC } from 'react';
import './breadCrumps.scss';
import { Button } from '@entities/button/button';


interface VoidFunc {
    (): void
}

export interface BreadCrumpsProps {
    dirs: string[];
    reactOnElements?: VoidFunc[]
    onClick: () => void
}

export const BreadCrumps: FC<BreadCrumpsProps> = ({ dirs, reactOnElements, onClick }) => {
    return <>
        <div className='bread-crumps'>
            {dirs.map((value, index) => {
                if (value === '') return null

                return <p
                    key={value}
                    onClick={reactOnElements ? reactOnElements[index] : () => { }}>
                    {index === 0 ? value : `/${value}`}
                </p>
            })}
        </div>
        <Button
            buttonText={'Назад'}
            clickHandler={onClick}
            variant={'button-text'}
            disabled={dirs.length <= 1}
        />
    </>
}