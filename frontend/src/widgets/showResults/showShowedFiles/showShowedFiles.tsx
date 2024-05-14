import { useAppSelector } from '@store/store';
import React,{ FC, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import { getInternalURLFront } from '@helpers/transformsToURL';
import { changeDir, newValues } from '@store/showRequest';
import { switchToShow } from '@store/whatToShow';
import { useNavigate } from 'react-router-dom';
import { ShowGlobal } from '../showGlobal';
import { useGetInternalFilesMutation } from '@api/filesApi';
import { useShowInternalParams } from '@helpers/hooks/useShowParams';
import { GetShowNoFilesErrorElement } from '@feature/errorElements';
import { giveAddPermission } from '@store/canAdd';

interface ShowShowedFilesProps { }

export const ShowShowedFiles: FC<ShowShowedFilesProps> = () => {
    const navigate = useNavigate();
    useShowInternalParams()
    
    const [show, showResp] = useGetInternalFilesMutation({ fixedCacheKey: 'show' });
    const showReq = useAppSelector(state => state.showRequest)
    
    const { isShow } = useAppSelector(state => state.whatToShow)
    const { isCanBeAdd } = useAppSelector(state => state.addPermission)

    const dispatch = useDispatch();

    useEffect(() => {
        if (isShow) {
            show([...showReq.dir].join('/'));
        }
        if (!isCanBeAdd) {
            dispatch(giveAddPermission())
        }
    }, [showReq, isShow])


    return (
        <ShowGlobal
            errorElement={<GetShowNoFilesErrorElement/>}
            getValue={() => { show(showReq.dir.join('/'))}} 
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
