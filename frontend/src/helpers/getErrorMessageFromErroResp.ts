import {ErrorMSG, isErrorMsg} from '@models/error'
import { SerializedError } from '@reduxjs/toolkit';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';

const getErrorMessageFromError = (error: ErrorMSG): string => {
    switch(error.data.status) {
        case 0:
            return 'Нужно ввести строку поиска'
        case 3:
            return 'Папка с таким именем уже существует'
    }
    console.trace('Получена неизвестная ошибка: ', error)
    return '';
}

export const getErrorMessageFromErroResp = (error: FetchBaseQueryError | SerializedError): string => {
    if (isErrorMsg(error)) {
        return getErrorMessageFromError(error);
    }
    console.trace('Получена неизвестная ошибка: ', error)
    return `Произошла неизвестная ошибка: ${JSON.stringify(error)}`;
};