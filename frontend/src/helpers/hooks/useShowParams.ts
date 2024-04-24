import { isNullOrUndefined } from '@helpers/isNullOrUndefined';
import { diskTypes, isDiskType } from '@models/disk';
import { fileTypes, transformToShowParams } from '@models/searchParams';
import { ConnectedClouds } from '@models/user';
import { useEffect } from 'react';
import { useAppSelector } from '@store/store';
import { useDispatch } from 'react-redux';
import { changeDisk, newValues } from '@store/showRequest';
import { useParamsFromURL } from './useParamsFromURL';
import { selectCloud } from '@store/userDisks';
import { switchDisk } from '@store/whatToShow';

export interface searchStateValue {
    fileType: fileTypes[];
    query: string;
    dir: string[];
    disk: diskTypes[] | ConnectedClouds[];
    externalDiskRequired: boolean;
    internalDiskRequired: boolean;
}

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

    if (!prevDisk && !!currentDisk) return false
    if (!!prevDisk && !currentDisk) return false
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
    const dispatch = useDispatch()

    const showState = {} as {
        fileType: fileTypes[];
        dir: string[];
        disk: diskTypes[] | ConnectedClouds[];
        externalDiskRequired?: boolean;
        internalDiskRequired?: boolean;
        shared_required?: boolean,
        personal_required?: boolean,
    }

    const urlParams = useParamsFromURL()
    const [params, diskName, cloudEmail, diskToShow] = transformToShowParams(urlParams)
    console.log('[params, diskName, cloudEmail],',[params, diskName, cloudEmail])

    
    let settedDisk: diskTypes | ConnectedClouds;
    if (params.disk !== 'all' && cloudEmail !== '') {
        const findedDisk = disks.clouds
        .find(
            val => cloudEmail === val.cloud_email
        )

        if (isNullOrUndefined(findedDisk)) {
            settedDisk = {
                access_token: '',
                cloud_email: cloudEmail,
                disk: diskName,
            }
        } else {
            settedDisk = findedDisk
        }   
    }

    if ((isNullOrUndefined(params.disk) || params.disk !== 'all') && (isNullOrUndefined(cloudEmail) ||cloudEmail === '')) {
        settedDisk = 'all'
    }

    showState.externalDiskRequired = params.externalDiskRequired
    showState.internalDiskRequired = params.internalDiskRequired
    showState.personal_required = params.personalReq
    showState.shared_required = params.sharedReq

    let settedDir: string[];
    if (params.dir.length === 0) {
        settedDir = []
    } else {
        settedDir = params.dir
    }
    
    useEffect(() => {
        if (diskToShow !== '' && isDiskType(diskToShow)) {
            dispatch(switchDisk(diskToShow))
        } else {
            dispatch(switchDisk('all'))

        }

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
                    personalReq: params.personalReq,
                    sharedReq: params.sharedReq,
                })
            )
            
            if (typeof settedDisk !== 'string') {
                dispatch(selectCloud(settedDisk))
            }
        }
    }, [])
    showState.disk = typeof settedDisk === 'string'
        ? [settedDisk]
        : [settedDisk]

    showState.dir = settedDir

    return { showState }
}