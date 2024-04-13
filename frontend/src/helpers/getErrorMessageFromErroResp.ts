import {ErrorMSG} from '@models/error'

export const getErrorMessageFromErroResp = (error: ErrorMSG):string => {
    console.log('errorerrorerror',error)
    if (error.data.status === 0) return 'Нужно ввести строку поиска'
    return ''
} 