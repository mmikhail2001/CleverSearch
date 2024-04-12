import { isNullOrUndefined } from '@helpers/isNullOrUndefined';
import { diskTypes, isDiskType } from '@models/disk';
import { fileTypes, transformToShowParams } from '@models/searchParams';
import { ConnectedClouds } from '@models/user';
import { useEffect, useState } from 'react';
import { useAppSelector } from '@store/store';
import { useDispatch } from 'react-redux';
import { selectCloud } from '@store/userDisks';
import { newValues } from '@store/showRequest';
import { useParamsFromURL } from './useParamsFromURL';

export interface searchStateValue {
    fileType: fileTypes[];
    query: string;
    dir: string[];
    disk: diskTypes[] | ConnectedClouds[];
    externalDiskRequired: boolean;
    internalDiskRequired: boolean;
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
    if (!prevDisk && !currentDisk) return true

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
    const showRequest = useAppSelector(state => state.showRequest)

    const showState = {} as {
        fileType: fileTypes[];
        dir: string[];
        disk: diskTypes[] | ConnectedClouds[];
        externalDiskRequired?: boolean;
        internalDiskRequired?: boolean;
    }

    const urlParams = useParamsFromURL()
    const params = transformToShowParams(urlParams)

    const dispatch = useDispatch()

    const settedDisk = isNullOrUndefined(params.disk)
        || params.disk === 'all' as diskTypes
        ? 'all' as diskTypes
        : disks.clouds
            .find(
                val => params.disk === val.cloud_email
            )

    showState.externalDiskRequired = params.externalDiskRequired
    showState.internalDiskRequired = params.internalDiskRequired

    let settedDir: string[];
    if (params.dir.length === 0) {
        settedDir = []
    } else {
        settedDir = params.dir
    }
    
    useEffect(() => {
        if (!
            (
                compareArrays(showRequest.dir,settedDir) 
                &&isDiskEqual(showRequest.disk, settedDisk)
                && showRequest.limit === Number(params.limit)
                && showRequest.offset === Number(params.offset) 
                && showRequest.externalDiskRequired === params.externalDiskRequired
                && showRequest.internalDiskRequired === params.internalDiskRequired
            )
        ){
            dispatch(
                newValues({
                    limit: Number(params.limit),
                    offset: Number(params.offset),
                    dir: settedDir,
                    disk: settedDisk,
                    externalDiskRequired: params.externalDiskRequired,
                    internalDiskRequired: params.internalDiskRequired,
                })
            )
        }
    }, [])
    showState.disk = typeof settedDisk === 'string'
        ? [settedDisk]
        : [settedDisk]

    showState.dir = settedDir

    return { showState }
}