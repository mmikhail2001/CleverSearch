import { fileFile } from "./files"

const eventChangeStatus = 'changeStatus'
export const events = eventChangeStatus

export interface Notify {
    event: typeof events
    file: fileFile
}
