import { useDispatch } from 'react-redux';
import { removeFiles, removeNotify } from '@store/fileProcess';
import {fileFile} from '@models/files'
import { notificationBar } from '@helpers/notificationBar';

export const fileUploadNotification = (files: fileFile[]) => {
    const dispatch = useDispatch()

    files.forEach(file => {
        if (!file) return null
        const message = `File was processed: ${file.filename}`
        notificationBar({
            children: message,
            variant: 'info'
        })
        dispatch(removeNotify([file]))
        dispatch(removeFiles([file]))
    });

};
