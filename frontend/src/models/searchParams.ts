export type diskTypes = 'google' | 'yandex' | 'own' | 'local' | 'all';

/** if text of diskType return true */
export const isDiskType = (text: string): boolean => {
  if (['google', 'yandex', 'own', 'local', 'all'].includes(text)) return true;
  return false;
};

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
  path: string;
  is_shared: boolean;
  shared: {
    author_id: string;
    access: typeof sharedType;
    is_owner: boolean;
  };
  date: string;
  is_dir: boolean;
  size: string;
  'content_type': string;
  status: string;
  link: string,
}

export interface SearchResponse {
  status: number;
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
}

export interface ShowResponse {
  body: fileFile[];
}

export interface DiskSearch {
  disk: diskTypes;
  dir: string;
}

export type AccessRights = 'reader' | 'writer'

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