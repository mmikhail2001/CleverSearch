export interface Folder {
  userId: number;
  id: number;
  title: string;
  body: string;
}

export interface FolderResp {
  body: string,
  message: string,
  status: number,
}