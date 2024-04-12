import { isNullOrUndefined } from "@helpers/isNullOrUndefined";
import { diskTypes } from "@models/disk";
import { fileTypes, transformToSearchParams } from "@models/searchParams";
import { ConnectedClouds } from "@models/user";
import { useEffect } from "react";
import { useParamsFromURL } from "./useParamsFromURL";
import { useAppSelector } from "@store/store";
import { useDispatch } from "react-redux";
import { newValues } from "@store/searchRequest";

export interface searchStateValue {
    smartSearch: boolean;
    fileType: fileTypes[];
    query: string;
    dir: string[];
    disk: diskTypes[] | ConnectedClouds[];
}

export const useSearchParams = () => {
    const searchState = {} as {
        smartSearch: boolean;
        fileType: fileTypes[];
        query: string;
        dir: string[];
        disk: diskTypes[] | ConnectedClouds[];
    }

    const disks = useAppSelector(state => state.disks)

    const urlParams = useParamsFromURL()
    const params = transformToSearchParams(urlParams)

    const dispatch = useDispatch()

    let settedDisk = isNullOrUndefined(params.disk)
        || params.disk[0] === 'all' as diskTypes
        ? 'all' as diskTypes
        : disks.clouds
            .find(
                val => params.disk[0] === val.cloud_email
            )

    if (typeof settedDisk !== 'string' && !settedDisk) {
        settedDisk = 'all' as diskTypes
    }

    let settedDir: string[];
    if (params.dir.length === 0) {
        settedDir = []
    } else {
        settedDir = params.dir
    }

    searchState.disk = typeof settedDisk === 'string'
        ? [settedDisk]
        : [settedDisk]

    searchState.dir = settedDir
    searchState.fileType = params.fileType
    searchState.query = params.query
    searchState.smartSearch = params.smartSearch

    useEffect(() => {
        dispatch(newValues({
            query: searchState.query,
            smartSearch: searchState.smartSearch,
            dir: searchState.dir,
            disk: searchState.disk,
            fileType: params.fileType,
            limit: params.limit,
            offset: params.offset,
        }))
    }, [])

    return { searchState }
}