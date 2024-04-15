import { useShowMutation } from '@api/searchApi';
import { useAppSelector } from '@store/store';
import React, { FC, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { useDeleteFileMutation } from '@api/filesApi';
import { BreadCrumps } from '@entities/breadCrumps/breadCrumps';
import { RenderFields } from '@widgets/renderFields/renderFields';
import { transfromToShowRequestString } from '@api/transforms';
import { useNavigate } from 'react-router-dom';
import { switchToShow } from '@store/whatToShow';
import '../show.scss'
import { useShowParams } from '@helpers/hooks/useShowParams'
import { changeDir, newValues } from '@store/showRequest';

interface ShowShowedFilesProps { }

export const ShowShowedFiles: FC<ShowShowedFilesProps> = () => {
    const navigate = useNavigate();
    const { showState } = useShowParams()
    const [show, showResp] = useShowMutation({ fixedCacheKey: 'show' });

    const showReq = useAppSelector(state => state.showRequest)
    const showParam = useAppSelector(state => state.showRequest)
    
    const { isShow } = useAppSelector(state => state.whatToShow)

    const [deleteFile] = useDeleteFileMutation();
    const dispatch = useDispatch();

    const isPersonal = typeof showReq.disk === 'string'

    useEffect(() => {
        if (isShow) {
            show({
                ...showParam,
                disk: showReq.disk,
                dir: showReq.dir,
                externalDiskRequired: !isPersonal,
                internalDiskRequired: isPersonal,
                });
        }

    }, [showReq, isShow])

    if (!isShow) {
        dispatch(switchToShow())
    }

    return (
        <div className="data-show">
            <div className="data-show__header">
                <BreadCrumps
                    dirs={['Show', ...showReq.dir]}
                    onClick={() => {
                        const url = transfromToShowRequestString(
                            {
                                fileType: showState.fileType,
                                disk: showReq.disk,
                                dir: showReq.dir.slice(0, -1) || [],
                                limit: 10,
                                offset: 0,
                                externalDiskRequired: showState.externalDiskRequired,
                                internalDiskRequired: showState.internalDiskRequired,
                            }
                        )
                        dispatch(
                            dispatch(newValues({...showReq, dir: showReq.dir.slice(0, -1) || []}))
                        )
                        navigate(url, { replace: true })
                    }}
                    reactOnElements={
                        ['Show', ...showReq.dir].map((dir, index) => {
                            return () => {
                                let dirToSet: string[] = []
                                if (index !== 0) 
                                    dirToSet = showReq.dir.slice(0, index)
                                const url = transfromToShowRequestString(
                                    {
                                        ...showReq,
                                        dir: dirToSet,
                                    }
                                )
                                dispatch(changeDir(dirToSet))
                                navigate(url, { replace: true })
                            }
                        })
                    }
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
                                ...showParam, 
                                disk: showReq.disk, 
                                dir: showReq.dir,
                                externalDiskRequired: !isPersonal,
                                internalDiskRequired: isPersonal,
                            });
                            dispatch(newValues({
                                ...showParam,
                                 disk: showReq.disk,
                                  dir: showReq.dir,
                                  externalDiskRequired: !isPersonal,
                                  internalDiskRequired: isPersonal,
                                }))
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
