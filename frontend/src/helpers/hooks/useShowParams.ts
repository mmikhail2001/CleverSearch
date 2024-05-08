import { isNullOrUndefined } from '@helpers/isNullOrUndefined';
import { diskTypes, isDiskType } from '@models/disk';
import { fileTypes } from '@models/searchParams';
import { ConnectedClouds } from '@models/user';
import { useEffect } from 'react';
import { useAppSelector } from '@store/store';
import { useDispatch } from 'react-redux';
import { newValues } from '@store/showRequest';
import { useParamsFromURL } from './useParamsFromURL';
import { selectCloud } from '@store/userDisks';
import { switchDisk } from '@store/whatToShow';
import { useNavigate } from 'react-router-dom';


export const compareArrays = (a: any[], b: any[]): boolean =>
    a
    && b
    && a.length === b.length &&
    a.every((element: any, index: number) => element === b[index]);

export const useShowInternalParams = () => {
    const showRequest = useAppSelector(state => state.showRequest)
    const dispatch = useDispatch()

    const urlParams = useParamsFromURL()
    let dir: string[] = []
    if ("dir" in urlParams) {
        dir = urlParams.dir.split('/')
    } else {
        dir = []
    }
    
    useEffect(() => {
        dispatch(switchDisk('internal'))

        if (!
            (
                compareArrays(showRequest.dir,dir) 
            )
        ){
            dispatch(
                newValues({
                    ...showRequest,
                    dir: dir,
                })
            )
            
        }
    }, [])

    return dir 
}

export const useShowDriveParams = () => {
    const showRequest = useAppSelector(state => state.showRequest)
    const userDisks = useAppSelector(state => state.disks)

    const dispatch = useDispatch()
    const navigate = useNavigate()

    let dir: string[] = []
    let disk: ConnectedClouds = {} as ConnectedClouds
    
    const urlParams = useParamsFromURL()

    if ("dir" in urlParams) {
        dir = urlParams.dir.split('/')
    }

    if ('cloud_email' in urlParams) {
        let email = urlParams.cloud_email
        const diskFound = userDisks.clouds.find(
            (val) => val.cloud_email === email
        )
        disk = diskFound
    }
    
    useEffect(() => {
        if (disk.cloud_email === '') {
            console.warn("can't find cloud email in drive")
            dispatch(switchDisk('internal'))
            navigate('/internal')
            
            return
        } else {
            dispatch(switchDisk(disk))
            dispatch(selectCloud(disk))
        }

        if (!
            (
                compareArrays(showRequest.dir,dir) 
            )
        ){
            dispatch(
                newValues({
                    ...showRequest,
                    dir: dir,
                })
            )
            
        }
    }, [])

    return dir 
}

export const useSharedParams = () => {
    const showRequest = useAppSelector(state => state.showRequest)
    const dispatch = useDispatch()

    const urlParams = useParamsFromURL()
    let dir: string[] = []
    if ("dir" in urlParams) {
        dir = urlParams.dir.split('/')
    } else {
        dir = []
    }
    
    useEffect(() => {
        dispatch(switchDisk('internal'))

        if (!
            (
                compareArrays(showRequest.dir,dir) 
            )
        ){
            dispatch(
                newValues({
                    ...showRequest,
                    dir: dir,
                })
            )
            
        }
    }, [])

    return dir 
}
