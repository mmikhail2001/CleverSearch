import { isNullOrUndefined } from "@helpers/isNullOrUndefined";
import { diskTypes } from "@models/disk";
import { fileTypes, transformToSearchParams, transformToShowParams } from "@models/searchParams";
import { ConnectedClouds } from "@models/user";
import { useEffect, useState } from "react";
import { useParamsFromURL } from "./useParamsFromURL";
import { useLocation } from "react-router-dom";
import { useAppSelector } from "@store/store";
import { useDispatch } from "react-redux";
import { changeDir, changeDisk } from "@store/currentDirectoryAndDisk";

export interface searchStateValue {
    smartSearch: boolean;
    fileType: fileTypes[];
    query: string;
    dir: string[];
    disk: diskTypes[] | ConnectedClouds[];
}

export const useShowParams = () => {
    const [searchState, setSearchState] = useState({} as {
        smartSearch: boolean;
        fileType: fileTypes[];
        query: string;
        dir: string[];
        disk: diskTypes[] | ConnectedClouds[];
    })
    const location = useLocation()
    const urlParams = useParamsFromURL()
    const params = transformToShowParams(urlParams)
    const disks = useAppSelector(state => state.disks)

    const dispatch = useDispatch()

    useEffect(() => {
        const settedDisk = isNullOrUndefined(params.disk)
            && params.disk === 'all' as diskTypes
            ? 'all' as diskTypes
            : disks.clouds
                .find(
                    val =>
                        params.disk === val.cloud_email)
        console.log("disk", settedDisk)
        dispatch(changeDir({ dirs: params.dir }))
        dispatch(changeDisk(settedDisk))
    }, [params, location])

    return { searchState, setSearchState }
}