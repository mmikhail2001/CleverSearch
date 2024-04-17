import React, { FC, useState } from 'react';
import { NotificationBar } from '@entities/notificationBar/notificationBar'
import { useAppSelector } from '@store/store';
import { useDispatch } from 'react-redux';
import { removeFiles, removeNotify } from '@store/fileProcess';
import { Typography } from '@mui/material';
import './fileUploadNotification.scss'

interface FileUploadNotificationProps {
}

export const FileUploadNotification: FC<FileUploadNotificationProps> = () => {
    const {fileToNotify} = useAppSelector(state => state.fileProcess)
    const {isShared} = useAppSelector(state => state.whatToShow)
    const dispatch = useDispatch()
    const [open, setOpen] = useState<boolean>(true)
    
    const file = fileToNotify[0]

    if (!file) return null
    if (!open) setOpen(true)
        
    return (
        <React.Fragment>
            <NotificationBar
                isOpen={open}
                setOpen={() => {
                    setOpen(false)

                    dispatch(removeNotify([file]))
                    if (!isShared)
                        dispatch(removeFiles([file]))
                }}
                className="notify"
                autoHideDuration={5000}
            >
                <Typography fontSize={'var(--ft-body)'}>Файл обработан: {file.filename}</Typography>
            </NotificationBar>
        </React.Fragment>
    );
};
