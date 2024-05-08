import React, { FC, useRef, useState } from 'react';

import './showInfoButton.scss'
import { Typography } from '@mui/material';

interface ShowInfoButtonProps {
}

export const ShowInfoButton: FC<ShowInfoButtonProps> = ({

}) => {
  const [openInfo, setOpenInfo] = useState(false)

  return (
    <div style={{
      padding: '3rem',
      gap: '8px',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <Typography 
        style={{
          display:'flex', 
          justifyContent: 'center',
          cursor: 'pointer',
        }} 
        onClick={() => setOpenInfo(!openInfo)}
        fontSize={'var(--ft-body-plus)'}
        color='rgba(255,255,255, 1)'
      >
        {openInfo ? "Close Info" : "Show Info"}
      </Typography>
      <Typography
        className={['info-text', openInfo ? 'visible' : ''].join(' ')}
        fontSize={'var(--ft-body)'}
        color='rgba(255,255,255, 0.7)'
      >
        CleverSearch is a web application designed to revolutionize data management and retrieval. Users can store their data securely, effortlessly share it with others, and seamlessly integrate external drives for expanded storage options. The standout feature of CleverSearch is its intelligent semantic search capability, allowing users to search for meaning across all their files. Whether it's documents, images, or any other file type, CleverSearch's advanced search functionality ensures users can quickly locate the information they need, regardless of where it's stored. With CleverSearch, managing and accessing your data has never been easier or more intuitive.
      </Typography>
    </div>
  );
};
