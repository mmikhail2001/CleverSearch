import { diskTypes } from "./disk";
import { fileTypes, sharedType } from "./searchParams";

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
    time_created: string;
    link: string,
    cloud_email: string,
    disk: diskTypes,
    shared: {
      author_id: string;
      access: typeof sharedType;
      is_owner: boolean;
    };
    duration?: number,
    timestart?: number,
    page_number?: number,
    is_fav?: boolean,
  }

export interface DriveReq {
    dir?: string,
    // If email not writed than get all files from disks
    email?: string,
}

