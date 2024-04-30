import { isNullOrUndefined } from '@helpers/isNullOrUndefined';
import { diskTypes, isDiskType } from './disk';
import { ConnectedClouds } from './user';
import { fileFile } from './files';

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


export interface SearchParams {
  smartSearch: boolean;
  fileType?: fileTypes[];
  query: string;
  dir?: string[];
  sharedReq?: boolean,
}


export interface SearchResponse {
  status: number;
  message: string;
  body: fileFile[];
}

export interface ShowParams {
  dir?: string[];
  disk?: diskTypes | ConnectedClouds;
  query?:string;
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
