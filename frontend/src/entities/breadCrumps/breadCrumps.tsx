import React, { FC } from 'react';
import './breadCrumps.scss';


interface VoidFunc {
    (): void
}

export interface BreadCrumpsProps {
    dirs: string[];
    reactOnElements?: VoidFunc[]
}

export const BreadCrumps: FC<BreadCrumpsProps> = ({ dirs, reactOnElements }) => {
    return <div className='bread-crumps'>
        {dirs.map((value, index) => {
            if (value === '') return <div></div>
            return <p
                onClick={reactOnElements ? reactOnElements[index] : () => { }}>
                /{value}
            </p>
        })}
    </div>
}