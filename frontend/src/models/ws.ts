import { fileFile } from "./files"


export interface Notify {
    event: 'changeStatus' | 'PING'
    file: fileFile
}
