import { diskTypes } from "./disk";

export const sharedType = {
  reader: 'reader',
  writer: 'writer',
} as const;

export type fileTypes = 'all' | 'img' | 'video' | 'text' | 'audio';

/** if text of diskType return true */
export const isFileType = (text: string): boolean => {
  if (['all', 'img', 'video', 'text', 'audio'].includes(text)) return true;
  return false;
};


export interface SearchParamsLocal {
  smartSearch: boolean;
  fileType?: fileTypes[];
  query: string;
  dir?: string[];
  disk?: diskTypes[];
  sharedReq?: boolean,
  dirsReq?: boolean,
  filesReq?: boolean,
  nestingReq?: boolean,
  personalReq?: boolean,
}

export const transformToSearchParams = (obj: {
  query?: string, smartSearch?: boolean, limit?: number, offset?: number, file_type?: string, dir?: string, disk?: string
}) => {
  let fileType: fileTypes[];
  if (obj.file_type) {
    fileType = obj.file_type.split(',')?.filter(val => isFileType(val)) as fileTypes[] || ['all']
  } else {
    fileType = ['all']
  }

  return {
    limit: obj.limit || 10,
    offset: obj.offset || 0,
    fileType: fileType || 'all',
    dir: obj.dir ? obj.dir.split('/').filter(val => val !== '') : [],
    disk: obj.disk?.split(',') || ['all'],
    query: obj.query || '',
    smartSearch: obj.smartSearch || false,
  } as SearchParams
}



export interface SearchParams extends SearchParamsLocal {
  limit?: number;
  offset?: number;
}

export interface fileFile {
  id: string;
  filename: string;
  user_id: string;
  email: string,
  path: string;
  bucket: string,
  is_dir: boolean;
  file_type: fileTypes,
  size: string;
  'content_type': string;
  extension: string;
  status: string;
  is_shared: boolean,
  share_access: string,
  share_link: string,
  date: string;
  link: string,
  shared: {
    author_id: string;
    access: typeof sharedType;
    is_owner: boolean;
  };
  duration?: number,
  start_time?: number,
  page_number?: number,
}

export interface SearchResponse {
  status: number;
  message: string;
  body: fileFile[];
}

export const transformToShowParams = (obj: {
  limit?: number, offset?: number, file_type?: string, dir?: string, disk?: string
}) => {
  let fileType: fileTypes[];
  if (obj.file_type) {
    fileType = obj.file_type.split(',')?.filter(val => isFileType(val)) as fileTypes[] || ['all']
  } else {
    fileType = ['all']
  }

  return {
    limit: obj.limit || 10,
    offset: obj.offset || 0,
    fileType: fileType || 'all',
    dir: obj.dir ? obj.dir.split('/').filter(val => val !== '') : [],
    disk: obj.disk || 'all',
  } as ShowParams
}

export interface ShowParams {
  limit: number;
  offset: number;
  fileType?: fileTypes[];
  dir?: string[];
  disk?: diskTypes;
  sharedReq?: boolean,
  dirsReq?: boolean,
  filesReq?: boolean,
  nestingReq?: boolean,
  personalReq?: boolean,
}

export interface ShowResponse {
  body: fileFile[];
}

export interface SharedUUIDResponse {
  body: fileFile
}

export interface DiskSearch {
  disk: diskTypes;
  dir: string;
}

export type AccessRights = 'reader' | 'writer' | ''

export const isAccessRights = (stringToCheck: string): boolean => {
  return stringToCheck === 'reader' || stringToCheck === 'writer'
}

export const getAccessRights = (stringToTransfrom: string): AccessRights => {
  switch (stringToTransfrom) {
    case 'reader':
      return 'reader';
    case 'writer':
      return 'writer'
    default:
      return 'writer'
  }
}

export interface ShareRequest {
  dir: string;
  access_type: AccessRights;
  by_emails: boolean;
  emails: string[]
}

export interface ShareResponse {
  body: {
    share_link: string
  },
  message: string,
  status: number,
}
