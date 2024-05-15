import React, { FC } from 'react'

import NothingSVG from '@icons/Nothing.svg'
import EmptyResultSearch from '@icons/EmptyResultSearch.svg'
import BugFixing from '@icons/FixingBugs.svg'
import { Typography } from '@mui/material'
import { useMobile } from 'src/mobileProvider'

export const GetSearchNoFilesErrorElement:FC = () => {
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
                    src={EmptyResultSearch} 
                />
                <Typography fontSize={'var(--ft-pg-24)'}>Results not found</Typography>
            </div>
        </div>;
}