import { fileFile } from "./files"


export interface Notify {
    event: 'changeStatus' | 'PONG'
    file: fileFile
}
