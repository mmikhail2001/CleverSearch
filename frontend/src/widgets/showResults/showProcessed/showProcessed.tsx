import { useAppSelector } from '@store/store';
import React, { FC, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { useDeleteFileMutation } from '@api/filesApi';
import {  useShowProcessedMutation } from '@api/searchApi';
import { RenderFields } from '@widgets/renderFields/renderFields';
import { useNavigate } from 'react-router-dom';
import {  switchToProcessed } from '@store/whatToShow';
import { transfromToShowRequestString } from '@api/transforms';
import '../show.scss'
import { BreadCrumps } from '@entities/breadCrumps/breadCrumps';
import { useShowParams } from '@helpers/hooks/useShowParams';
import { removeFiles } from '@store/fileProcess';

interface ShowProcessedFilesProps { }


export const ShowProcessedFiles: FC<ShowProcessedFilesProps> = () => {
    const { isProccessed } = useAppSelector(state => state.whatToShow)
    const navigate = useNavigate();
    const { showState } = useShowParams()
    const [show, showResp] = useShowProcessedMutation({ fixedCacheKey: 'processed' });

    const [deleteFile] = useDeleteFileMutation();
    const dispatch = useDispatch();

    const filesProcessed = useAppSelector(state => state.fileProcess)

    useEffect(() => {
        if (isProccessed) {
            show({
                limit: 10,
                offset: 0,
                });
        }

        if (filesProcessed.fileOnProcess && filesProcessed.fileOnProcess.length > 1) {
            dispatch(removeFiles(filesProcessed.fileOnProcess))
        }
    }, [isProccessed,filesProcessed.fileOnProcess])

    if (!isProccessed) {
        dispatch(switchToProcessed())
    }

    return (
        <div className="data-show">
            <div className="data-show__header">
                <BreadCrumps
                    dirs={['Processed']}
                    onClick={() => {
                        const url = transfromToShowRequestString(
                            {
                                fileType: showState.fileType,
                                disk: 'all',
                                dir: [],
                                limit: 10,
                                offset: 0,
                                externalDiskRequired: showState.externalDiskRequired,
                                internalDiskRequired: showState.internalDiskRequired,
                            }
                        )
                        navigate(url, { replace: true })
                    }}
                    reactOnElements={[
                        // TODO если сделаем папки в processed
                    ]}
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
                        setTimeout(() =>{
                            show({
                                limit: 10,
                                offset: 0,
                            });
                        },
                            100)
                        }
                    }
                openFolder={(path) => {
                    const url = transfromToShowRequestString(
                        {
                            fileType: showState.fileType,
                            disk: showState.disk[0],
                            limit: 10,
                            offset: 0,
                            dir: path || [],
                            externalDiskRequired: showState.externalDiskRequired,
                            internalDiskRequired: showState.internalDiskRequired,
                        }
                    )
                    navigate(url, { replace: true })
                }}
            />
        </div>
    );
};