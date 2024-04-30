import { isNullOrUndefined } from "@helpers/isNullOrUndefined";
import { SearchParams, ShowParams, fileTypes, isFileType } from "./searchParams";
import { diskTypes } from "./disk";

const getDirFromString =(str:string): string[] => {
    let dir = str?.split('/').filter(val => val !== '');
    if (dir) {
      if (dir.length === 0) {
        dir = []
      }
    } else {
      dir = []
    }

    return dir
}

// Shared
export const transformToSharedParams = (obj: {
    dir?: string,
  }) => {
    return getDirFromString(obj.dir) as string[]
}

// Drive
export const transformToDriveParams = (obj: {
    dir?: string,
    cloud_email?:string,
  }) => {
    let dir = getDirFromString(obj.dir)
  
    return {dir: dir, email: obj.cloud_email || ''} as {dir:string[], email:string}
}

// Internal
export const transformToInternalParams = (obj: {
    dir?: string,
  }) => {
    return getDirFromString(obj.dir) as string[]
}

// Search
export const transformToSearchParams = (obj: {
    query?: string,
    is_smart_search?: string,
    file_type?: string,
    dir?: string,
  }) => {
    let fileType: fileTypes[] | string[];
    if (obj.file_type) {
      fileType = obj.file_type.split(',')?.filter(val => isFileType(val)) || ['all']
    } else {
      fileType = ['all']
    }
  
    return {
      fileType: fileType || 'all',
      dir: obj.dir ? obj.dir.split('/').filter(val => val !== '') : [],
      query: obj.query || '',
      smartSearch: obj.is_smart_search === 'true' ? true : false,
    } as SearchParams
}