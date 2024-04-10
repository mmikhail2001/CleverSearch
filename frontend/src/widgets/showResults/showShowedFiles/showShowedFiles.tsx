import { useShowMutation } from '@api/searchApi';
import { useAppSelector } from '@store/store';
import React, { FC, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import { useDeleteFileMutation } from '@api/filesApi';
import { changeDir, changeDisk } from '@store/currentDirectoryAndDisk';
import { BreadCrumps } from '@entities/breadCrumps/breadCrumps';
import { RenderFields } from '@widgets/renderFields/renderFields';
import { transformToShowParams } from '@models/searchParams';
import { transfromToShowRequestString } from '@api/transforms';
import { useNavigate } from 'react-router-dom';
import { switchToShow } from '@store/whatToShow';
import '../show.scss'
import { useParamsFromURL } from '@helpers/hooks/useParamsFromURL';
import { Typography } from '@mui/material';
import { useShowParams } from '@helpers/hooks/useShowParams'

interface ShowShowedFilesProps { }

export const ShowShowedFiles: FC<ShowShowedFilesProps> = () => {
    const navigate = useNavigate();
    const urlParams = useParamsFromURL()
    const [params] = useState(transformToShowParams(urlParams))

    const [show, showResp] = useShowMutation({ fixedCacheKey: 'show' });
    const { currentDisk, dirs } = useAppSelector(
        (state) => state.currentDirDisk
    );

    const { isShow } = useAppSelector(state => state.whatToShow)

    const [deleteFile] = useDeleteFileMutation();
    const dispatch = useDispatch();


    useEffect(() => {
        dispatch(changeDir({ dirs: params.dir }))
        dispatch(changeDisk(params.disk))
    }, [params])

    useEffect(() => {
        show({ limit: 10, offset: 0, disk: currentDisk, dir: dirs });
    }, [dirs, currentDisk])

    if (!isShow) {
        dispatch(switchToShow())
    }

    return (
        <div className="data-show">
            <div className="data-show__header">
                <BreadCrumps
                    dirs={['Show', ...dirs]}
                    onClick={() => {
                        const url = transfromToShowRequestString(
                            { ...params, dir: dirs.slice(0, -1) || [] }
                        )
                        dispatch(
                            changeDir({
                                dirs: dirs.slice(0, -1) || [],
                            })
                        )
                        navigate(url, { replace: true })
                    }}
                    reactOnElements={[]}
                />
            </div>
            <RenderFields
                data={showResp.data?.body}
                error={showResp.error}
                isError={showResp.isError}
                isLoading={showResp.isLoading}
                dispatch={dispatch}
                deleteFile={
                    (fileName: string): void => {
                        deleteFile([fileName]);
                        setTimeout(() =>
                            show(
                                { limit: 10, offset: 0, disk: currentDisk, dir: dirs }),
                            100);
                    }}
                openFolder={(path) => {
                    const url = transfromToShowRequestString(
                        { ...params, dir: path || [] }
                    )
                    navigate(url, { replace: true })
                }}
            />
        </div>
    );
};
