import { useAppSelector } from '@store/store';
import React, { FC, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { useDeleteFileMutation } from '@api/filesApi';
import { useSearchMutation } from '@api/searchApi';
import { changeDir, changeDisk } from '@store/currentDirectoryAndDisk';
import { RenderFields } from '@widgets/renderFields/renderFields';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { switchToSearch, switchToShow } from '@store/whatToShow';
import { transfromToShowRequestString } from '@api/transforms';
import { transformToSearchParams } from '@models/searchParams'
import '../show.scss'
import { BreadCrumps } from '@entities/breadCrumps/breadCrumps';

interface ShowSearchedFilesProps { }

const useSearchUrlParams = () => {
    const [searchParams] = useSearchParams();
    const searchParamsToObject = (params: URLSearchParams) => {
        const result: Record<string, string> = {};
        params.forEach((value, key) => {
            result[key] = value;
        });
        return result;
    };

    return searchParamsToObject(searchParams)
}


export const ShowSearchedFiles: FC<ShowSearchedFilesProps> = () => {
    const [deleteFile] = useDeleteFileMutation();
    const [search, { data, ...searchResp }] = useSearchMutation({ fixedCacheKey: 'search' });
    const dispatch = useDispatch();

    const navigate = useNavigate()
    const urlParams = useSearchUrlParams()

    useEffect(() => {
        dispatch(switchToSearch())
        const params = transformToSearchParams(urlParams)
        search(params)
    }, [])

    const paramsSearch = useAppSelector((state) => state.searchRequest);

    return (
        <div className="data-show" >
            <BreadCrumps
                dirs={['Search']}
                onClick={() => {
                    navigate(-1)
                }}
                reactOnElements={[]}
            />
            <div className="data-show__header">
                <p>Результаты поиска:</p>
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
                    dispatch(changeDir({ dirs: path }))
                    dispatch(changeDisk('all'));
                    dispatch(switchToShow());

                    const url = transfromToShowRequestString({ limit: 10, offset: 0, dir: path });
                    navigate(url)
                }}
            />
        </div>
    );
};
