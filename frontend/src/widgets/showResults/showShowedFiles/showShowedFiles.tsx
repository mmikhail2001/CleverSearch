import { useShowMutation } from '@api/searchApi';
import { useAppSelector } from '@store/store';
import React, { FC, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import { useDeleteFileMutation } from '@api/filesApi';
import { changeDir } from '@store/currentDirectoryAndDisk';
import { BreadCrumps } from '@entities/breadCrumps/breadCrumps';
import { RenderFields } from '@widgets/renderFields/renderFields';
import { transfromToShowRequestString } from '@api/transforms';
import { useNavigate } from 'react-router-dom';
import { switchToShow } from '@store/whatToShow';
import '../show.scss'
import { compareArrays, isDiskEqual, useShowParams } from '@helpers/hooks/useShowParams'
import { dir } from 'console';

interface ShowShowedFilesProps { }

export const ShowShowedFiles: FC<ShowShowedFilesProps> = () => {
    const navigate = useNavigate();
    const { showState } = useShowParams()
    const [show, showResp] = useShowMutation({ fixedCacheKey: 'show' });

    const { currentDisk, dirs } = useAppSelector(
        (state) => state.currentDirDisk
    );
    const { isShow } = useAppSelector(state => state.whatToShow)

    const [deleteFile] = useDeleteFileMutation();
    const dispatch = useDispatch();

    useEffect(() => {
        if (isShow) {
            show({ limit: 10, offset: 0, disk: currentDisk, dir: dirs });
        }

    }, [currentDisk, dirs, isShow])

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
                            {
                                fileType: showState.fileType,
                                disk: showState.disk[0],
                                dir: dirs.slice(0, -1) || [],
                                limit: 10,
                                offset: 0,
                            }
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
                        {
                            fileType: showState.fileType,
                            disk: showState.disk[0],
                            limit: 10,
                            offset: 0,
                            dir: path || [],
                        }
                    )
                    navigate(url, { replace: true })
                }}
            />
        </div>
    );
};
