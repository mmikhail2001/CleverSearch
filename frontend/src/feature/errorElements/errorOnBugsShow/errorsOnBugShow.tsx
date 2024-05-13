import React, { FC } from 'react'

import BugFixing from '@icons/FixingBugs.svg'
import { Typography } from '@mui/material'
import { useMobile } from 'src/mobileProvider'

interface ErrorProps {
    error: string,
}

export const GetErrorElementOnBugShow: FC<ErrorProps> = ({error}) => {
    const {whatDisplay} = useMobile()
    const isMobile = whatDisplay !== 1

    return <div className='show-all-files' style={{fontSize: 'var(--ft-body-plus)'}}>
    <div style={{
        width: '100%',
        height: '100%',
        paddingTop: '2rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
    }}>
        <img
            style={{
                height: '100%',
                width: '100%',
                maxWidth: isMobile ? '200px' :'300px',
                maxHeight:isMobile ? '200px' : '300px',
            }} 
            src={BugFixing} 
        />
        <Typography fontSize={'var(--ft-pg-24)'}>{error}</Typography>
    </div>
</div>;
}
