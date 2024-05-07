import { useAppSelector } from '@store/store';
import React,{ FC, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { getInternalURLFront } from '@helpers/transformsToURL';
import { changeDir, newValues } from '@store/showRequest';
import { switchToShow } from '@store/whatToShow';
import { useNavigate } from 'react-router-dom';
import { ShowGlobal } from '../showGlobal';
import { useGetInternalFilesMutation } from '@api/filesApi';
import { useSharedParams } from '@helpers/hooks/useShowParams';

interface ShowShowedFilesProps { }

export const ShowShowedFiles: FC<ShowShowedFilesProps> = () => {
    const navigate = useNavigate();
    useSharedParams()
    
    const [show, showResp] = useGetInternalFilesMutation({ fixedCacheKey: 'show' });
    const showReq = useAppSelector(state => state.showRequest)
    
    const { isShow, whatDiskToShow } = useAppSelector(state => state.whatToShow)

    const dispatch = useDispatch();

    useEffect(() => {
        if (isShow) {
            show([showReq.dir].join('/'));
        }

    }, [showReq, isShow])


    return (
        <ShowGlobal
            getValue={() => show(showReq.dir.join('/'))} 
            whatShow={isShow} 
            switchToWhatShow={() => dispatch(switchToShow())} 
            firstElementInBreadCrumbs={'Show'} 
            dirs={[...showReq.dir]} 
            breadCrumbsReactions={(dir, index) => {
                return () => {
                    
                    let dirToSet: string[] = []
                    if (index !== 0) 
                        dirToSet = showReq.dir.slice(0, index)
                    const url = getInternalURLFront(dirToSet)
                    dispatch(changeDir(dirToSet))
                    navigate(url, { replace: true })
                }}
            } 
            openFolder={(path, disk) => {
                const url = getInternalURLFront(path)
                dispatch(newValues({
                    ...showReq,
                    dir: path,
                    disk: disk,
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
