import React, { FC } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import './loadingPage.scss'

export const LoadingPage: FC = () => {
    return <div className="loading-page">
        <CircularProgress />
    </div>
};
