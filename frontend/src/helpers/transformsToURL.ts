import { fileTypes } from '@models/searchParams';
export const getInternalURLFront = (dir: string[]):string => {
    return `/internal?dir=${dir.join('/')}`
}

export const getDriveURLFront = (dir: string[], email: string):string => {
    return `/drive?dir=${dir.join('/')}&cloud_email=${email}`
}

export const getSharedURLFront = (dir: string[]):string => {
    return `/shared?dir=${dir.join('/')}`
}

export const getSearchURLFront = (fileType: fileTypes[], isSmart: boolean, dir: string[], query: string):string => {
    return `/search?dir=${Array.isArray(dir) ? dir.join('/'): '/'}&file_type=${Array.isArray(fileType) ? fileType.join(',') : 'all'}&smart=${isSmart}&query=${query}`
}