import {ErrorMSG} from '@models/error'
import { SerializedError } from '@reduxjs/toolkit';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';

const getErrorMessageFromError = (error: ErrorMSG): string => {
    switch(error.data.status) {
        case 0:
            return 'Нужно ввести строку поиска'
    }
    return '';
}


const isErrorMSG = (error: any): error is ErrorMSG => {
    return 'status' in error 
    && 'data' in error 
    && 'status' in error.data 
    && 'message' in error.data 
    && 'body' in error.data;
};

export const getErrorMessageFromErroResp = (error: FetchBaseQueryError | SerializedError): string => {
    if (isErrorMSG(error)) {
        return getErrorMessageFromError(error);
    }
    return `Произошла неизвестная ошибка: ${JSON.stringify(error)}`;
};