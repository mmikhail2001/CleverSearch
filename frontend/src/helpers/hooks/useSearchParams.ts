import { isNullOrUndefined } from "@helpers/isNullOrUndefined";
import { diskTypes } from "@models/disk";
import { fileTypes, transformToSearchParams } from "@models/searchParams";
import { ConnectedClouds } from "@models/user";
import { useEffect, useState } from "react";
import { useParamsFromURL } from "./useParamsFromURL";
import { useLocation } from "react-router-dom";
import { useAppSelector } from "@store/store";

export interface searchStateValue {
    smartSearch: boolean;
    fileType: fileTypes[];
    query: string;
    dir: string[];
    disk: diskTypes[] | ConnectedClouds[];
}

export const useSearchParams = () => {
    const [searchState, setSearchState] = useState({} as {
        smartSearch: boolean;
        fileType: fileTypes[];
        query: string;
        dir: string[];
        disk: diskTypes[] | ConnectedClouds[];
    })
    const location = useLocation()
    const urlParams = useParamsFromURL()
    const params = transformToSearchParams(urlParams)
    const disks = useAppSelector(state => state.disks)

    console.log(urlParams)
    useEffect(() => {
        const settedDisk = isNullOrUndefined(params.disk)
            && params.disk === ['all'] as diskTypes[]
            ? ['all'] as diskTypes[]
            : [disks.clouds
                .find(
                    val =>
                        params.disk
                            .find(paramVal => paramVal === val.cloud_email))];
        console.log(urlParams, settedDisk)
        setSearchState({
            smartSearch: params.smartSearch || false,
            fileType: params.fileType || ['all'],
            query: params.query || '',
            dir: params.dir || ['/'],
            disk: settedDisk,
        })
    }, [location])

    return { searchState, setSearchState }
}