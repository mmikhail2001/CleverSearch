import { isNullOrUndefined } from '@helpers/isNullOrUndefined';
import { diskTypes } from '@models/disk';
import { fileTypes, transformToSearchParams, transformToShowParams } from '@models/searchParams';
import { ConnectedClouds } from '@models/user';
import { useEffect, useState } from 'react';
import { useParamsFromURL } from './useParamsFromURL';
import { useAppSelector } from '@store/store';
import { useDispatch } from 'react-redux';
import { changeDir, changeDisk } from '@store/currentDirectoryAndDisk';

export interface searchStateValue {
    smartSearch: boolean;
    fileType: fileTypes[];
    query: string;
    dir: string[];
    disk: diskTypes[] | ConnectedClouds[];
}

// HACK происходит магия 200 ререндеров
export const isDiskEqual = (prevDisk: ConnectedClouds | string, currentDisk: ConnectedClouds | string) => {
    if (typeof prevDisk !== typeof currentDisk) {
        return false
    }
    if (
        typeof prevDisk === 'string'
        && typeof currentDisk === 'string'
    ) {
        return prevDisk === currentDisk;
    }

    if (!!!prevDisk && !!currentDisk) return false
    if (!!prevDisk && !!!currentDisk) return false

    return (prevDisk as ConnectedClouds).cloud_email === (currentDisk as ConnectedClouds).cloud_email
        && (prevDisk as ConnectedClouds).disk === (currentDisk as ConnectedClouds).disk
}

export const compareArrays = (a: any[], b: any[]): boolean =>
    a
    && b
    && a.length === b.length &&
    a.every((element: any, index: number) => element === b[index]);

export const useShowParams = () => {
    const disks = useAppSelector(state => state.disks)
    const whatToShow = useAppSelector(state => state.currentDirDisk)
    const showState = {} as {
        fileType: fileTypes[];
        dir: string[];
        disk: diskTypes[] | ConnectedClouds[];
    }

    const urlParams = useParamsFromURL()
    const params = transformToShowParams(urlParams)

    const dispatch = useDispatch()

    const settedDisk = isNullOrUndefined(params.disk)
        || params.disk === 'all' as diskTypes
        ? 'all' as diskTypes
        : disks.clouds
            .find(
                val =>
                    params.disk === val.cloud_email
            )

    let settedDir: string[];
    if (params.dir.length === 0) {
        settedDir = []
    } else {
        settedDir = params.dir
    }

    const isDirEqual = compareArrays(whatToShow.dirs, settedDir)
    const isDiskEuqal = isDiskEqual(whatToShow.currentDisk, settedDir[0])

    useEffect(() => {
        if (!isDirEqual) {
            dispatch(changeDir({ dirs: settedDir }))
        }

        if (!isDiskEuqal) {
            dispatch(changeDisk(settedDisk))
        }

    }, [])
    showState.disk = typeof settedDisk === 'string'
        ? [settedDisk]
        : [settedDisk]

    showState.dir = settedDir

    return { showState }
}