import { useShowMutation } from '@api/searchApi';
import { useAppSelector } from '@store/store';
import React, { FC, useEffect, useRef, useState } from 'react';
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
    useShowParams()
    
    const mainElement = useRef<HTMLDivElement>(null)
    const headerElement = useRef<HTMLDivElement>(null)
    const [heightToSet, setheightToSet] = useState('100%')

    const {isOpen} = useAppSelector(state => state.searchFilter)

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

    useEffect(() => {
        if (mainElement.current && 
            headerElement.current 
        ) {
            setheightToSet(`calc(${String(
                mainElement.current.clientHeight - headerElement.current.clientHeight
            )}px - 4.8rem)`)
        }

    },[mainElement.current, headerElement.current])

    return (
        <div className="data-show" ref={mainElement} style={{filter: isOpen ? 'blur(5px)' : ''}}>
            <div className="data-show__header" ref={headerElement}>
                <BreadCrumps
                    dirs={['Show', ...showReq.dir]}
                    onClick={() => {
                        const url = transfromToShowRequestString(
                            {
                                ...showReq,
                                fileType: showReq.fileType,
                                dir: showReq.dir.slice(0, -1) || [],
                                externalDiskRequired: showReq.externalDiskRequired,
                                internalDiskRequired: showReq.internalDiskRequired,
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
                height={heightToSet}
                data={showResp.data?.body}
                error={showResp.error}
                isError={showResp.isError}
                isLoading={showResp.isLoading}
                deleteFile={
                    (fileName: string): void => {
                        deleteFile([fileName]);
                        setTimeout(() =>{
                            show({
                                ...showReq, 
                                disk: showReq.disk, 
                                dir: showReq.dir,
                                externalDiskRequired: !isPersonal,
                                internalDiskRequired: isPersonal,
                            });
                            dispatch(newValues({
                                ...showReq,
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
                            ...showReq,
                            fileType: showReq.fileType,
                            disk: showReq.disk,
                            dir: path || [],
                            externalDiskRequired: showReq.externalDiskRequired,
                            internalDiskRequired: showReq.internalDiskRequired,
                        }
                    )
                    dispatch(newValues({
                        ...showReq,
                        dir: path,
                        }))
                    navigate(url, { replace: true })
                }}
            />
        </div>
    );
};
