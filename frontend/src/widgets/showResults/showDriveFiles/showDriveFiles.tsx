import { useAppSelector } from '@store/store';
import React,{ FC, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { getDriveURLFront } from '@helpers/transformsToURL';
import { changeDir, newValues } from '@store/showRequest';
import { switchToExternal, switchToShow } from '@store/whatToShow';
import { useNavigate } from 'react-router-dom';
import { ShowGlobal } from '../showGlobal';
import { useGetDriveFilesMutation } from '@api/filesApi';
import { useShowDriveParams } from '@helpers/hooks/useShowParams';


interface ShowDriveFilesProps { }

export const ShowDriveFiles: FC<ShowDriveFilesProps> = () => {
    const navigate = useNavigate();
    useShowDriveParams()
    
    const [show, showResp] = useGetDriveFilesMutation({ fixedCacheKey: 'show' });
    const showReq = useAppSelector(state => state.showRequest)
    
    const { isExternal, whatDiskToShow } = useAppSelector(state => state.whatToShow)

    const dispatch = useDispatch();

    useEffect(() => {
        if (isExternal && typeof whatDiskToShow !== 'string') {
            show({
                dir:[showReq.dir].join('/'),
                email: whatDiskToShow.cloud_email,
            });
        }

    }, [showReq, isExternal])

    if (!isExternal) {
        dispatch(switchToExternal())
    }

    return (
        <ShowGlobal
            getValue={() => {
                if (typeof whatDiskToShow !== 'string') {
                    show({
                        dir:[showReq.dir].join('/'),
                        email: whatDiskToShow.cloud_email,
                    });
                } else {
                    console.error('whatDiskToShow is equal to string in driver page')
                }
            }} 
            whatShow={isExternal} 
            switchToWhatShow={() => dispatch(switchToExternal())} 
            firstElementInBreadCrumbs={'Show'} 
            dirs={[...showReq.dir]} 
            breadCrumbsReactions={(dir, index) => {
                return () => {
                    if (typeof whatDiskToShow === 'string') {
                        console.warn("open folder with wrong disk")
                        return
                    }

                    let dirToSet: string[] = []
                    if (index !== 0) 
                        dirToSet = showReq.dir.slice(0, index)
                    const url = getDriveURLFront(dirToSet,whatDiskToShow.cloud_email)
                    dispatch(changeDir(dirToSet))
                    navigate(url, { replace: true })
                }}
            } 
            openFolder={(path) => {
                if (typeof whatDiskToShow === 'string') {
                    console.warn("open folder with wrong disk")
                    return
                }
                const url = getDriveURLFront(path,whatDiskToShow.cloud_email)
                dispatch(newValues({
                    ...showReq,
                    dir: path,
                    disk: whatDiskToShow.cloud_email,
                    }))
                navigate(url, { replace: true })
            }}
            data={showResp.data?.body}
            error={showResp.error}
            isError={showResp.isError}
            isLoading={showResp.isLoading}
            
        />
    );
};
