import {ErrorMSG, isErrorMsg} from '@models/error'
import { SerializedError } from '@reduxjs/toolkit';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';

const getErrorMessageFromError = (error: ErrorMSG): string => {
    switch(error.data.status) {
        case 0:
            return 'Input query string'
        case 3:
            return 'Folder with this name already exist'
        case 11:
            return 'Technical problems. Try again later'
    }
    console.trace('Получена неизвестная ошибка: ', error)
    return '';
}

export const getErrorMessageFromErroResp = (error: FetchBaseQueryError | SerializedError): string => {
    if (isErrorMsg(error)) {
        return getErrorMessageFromError(error);
    }
    console.trace('Получена неизвестная ошибка: ', error)
    return `Unexpected error: ${JSON.stringify(error)}`;
};