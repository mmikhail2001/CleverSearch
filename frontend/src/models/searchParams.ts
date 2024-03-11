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

export interface SearchParams {
  smartSearch: boolean;
  fileType?: fileTypes[];
  query: string;
  dir?: string;
  disk?: diskTypes[];
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
}

export interface SearchResponse {
  status: number;
  body:fileFile[];
}

export interface ShowParams {
  limit: number;
  offset: number;
  fileType?: fileTypes[];
  query?: string;
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
