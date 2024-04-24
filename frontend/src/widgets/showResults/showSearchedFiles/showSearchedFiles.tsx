import { useAppSelector } from '@store/store';
import React, { FC, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { useDeleteFileMutation } from '@api/filesApi';
import { useSearchMutation } from '@api/searchApi';
import { RenderFields } from '@widgets/renderFields/renderFields';
import { useNavigate } from 'react-router-dom';
import { switchToSearch, switchToShow } from '@store/whatToShow';
import { transfromToShowRequestString } from '@api/transforms';
import '../show.scss'
import { BreadCrumps } from '@entities/breadCrumps/breadCrumps';
import { useSearchParams } from '@helpers/hooks/useSearchParams';
import { newValues } from '@store/showRequest';

interface ShowSearchedFilesProps { }

export const ShowSearchedFiles: FC<ShowSearchedFilesProps> = () => {
    const [deleteFile] = useDeleteFileMutation();
    const [search, { data, ...searchResp }] = useSearchMutation({ fixedCacheKey: 'search' });
    const dispatch = useDispatch();

    const navigate = useNavigate()
    useSearchParams()

    const showReq = useAppSelector(state => state.showRequest)
    const searchParams = useAppSelector(state => state.searchRequest)
    const { isSearch } = useAppSelector(state => state.whatToShow)

    useEffect(() => {
        if (searchParams.limit)
            search(searchParams)
    }, [searchParams])

    if (!isSearch) {
        dispatch(switchToSearch())
    }

    const paramsSearch = useAppSelector((state) => state.searchRequest);

    return (
        <div className="data-show" >
            <div className="data-show__header">
                <BreadCrumps
                    dirs={['Search']}
                    onClick={() => {
                        navigate(-1)
                    }}
                    reactOnElements={[
                        // TODO если сделаем поиск папки, то нужно доделать это место
                    ]}
                />
            </div>
            <RenderFields
                data={data?.body}
                error={searchResp.error}
                isError={searchResp.isError}
                isLoading={searchResp.isLoading}
                dispatch={dispatch}
                deleteFile={
                    (fileName: string): void => {
                        deleteFile([fileName]);
                        setTimeout(() =>
                            search(paramsSearch),
                            100);
                    }}
                openFolder={(path) => {
                    dispatch(newValues({...showReq, dir: path, disk: 'all'}))
                    dispatch(switchToShow());

                    const url = transfromToShowRequestString({ limit: 10, offset: 0, dir: path });
                    navigate(url)
                }}
            />
        </div>
    );
};
