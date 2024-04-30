import { useAppSelector } from '@store/store';
import React, { FC, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';

import { useDeleteFileMutation } from '@api/filesApi';
import { useSearchMutation } from '@api/searchApi';
import { RenderFields } from '@widgets/renderFields/renderFields';
import { useNavigate } from 'react-router-dom';
import { switchToDrive, switchToSearch, switchToShow } from '@store/whatToShow';
import { BreadCrumps } from '@entities/breadCrumps/breadCrumps';
import { useSearchParams } from '@helpers/hooks/useSearchParams';
import { newValues } from '@store/showRequest';
import { ShowGlobal } from '../showGlobal';
import { getDriveURLFront, getInternalURLFront } from '@helpers/transformsToURL';

interface ShowSearchedFilesProps { }

export const ShowSearchedFiles: FC<ShowSearchedFilesProps> = () => {
    const [search, { data, ...searchResp }] = useSearchMutation({ fixedCacheKey: 'search' });
    const dispatch = useDispatch();

    const navigate = useNavigate()
    useSearchParams()

    const showReq = useAppSelector(state => state.showRequest)
    const searchParams = useAppSelector(state => state.searchRequest)
    const { isSearch } = useAppSelector(state => state.whatToShow)

    useEffect(() => {
        if (searchParams.query)
            search(searchParams)
    }, [searchParams])

    if (!isSearch) {
        dispatch(switchToSearch())
    }

    const paramsSearch = useAppSelector((state) => state.searchRequest);

    return (
        <ShowGlobal
            firstElementInBreadCrumbs='Search'
            breadCrumbsReactions={() => { return () => { }; } }
            dirs={[]}
            getValue={() => search(paramsSearch)}
            data={data?.body}
            error={searchResp.error}
            isError={searchResp.isError}
            isLoading={searchResp.isLoading}
            openFolder={(path, disk) => {
                if (disk === 'internal') {
                    dispatch(newValues({ ...showReq, dir: path, disk: 'internal' }));
                    dispatch(switchToShow());
                    const url = getInternalURLFront(path);
                    navigate(url);
                    
                    return
                }
                    
                dispatch(newValues({ ...showReq, dir: path, disk: disk }));
                dispatch(switchToDrive());
                if (typeof disk !== 'string') {
                    const url = getDriveURLFront(path, disk.cloud_email);
                    navigate(url);
                }
            } }
            whatShow={isSearch}
            switchToWhatShow={() => dispatch(switchToSearch())}
            />
    );
};
