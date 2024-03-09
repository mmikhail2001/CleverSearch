export enum diskTypes {
  google = "google",
  yandex = "yandex",
  our = "our",
  local = "local",
  all = "all",
}

export const enum sharedType {
  reader = "reader",
  writer = "writer",
}

export enum fileTypes {
  all = "all",
  img = "img",
  video = "video",
  text = "text",
  audio = "audio",
}

export interface SearchParams {
  smartSearch: boolean;
  fileType?: fileTypes[];
  query: string;
  dir?: string;
  disk?: diskTypes[];
}

export interface fileFile {
  ID: string;
  filename: string;
  user_id: string;
  path: string;
  is_shared: boolean;
  shared: {
    author_id: string;
    access: sharedType;
    is_owner: boolean;
  };
  date: string;
  is_dir: boolean;
  size: string;
  "content-type": string;
  status: string;
}

export interface SearchResponse {
  files: fileFile[];
  total_count: number;
}

export interface ShowParams {
  limit: number;
  offset: number;
}

export interface ShowResponse {
  files: fileFile[];
}
