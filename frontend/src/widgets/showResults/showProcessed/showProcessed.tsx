import { useAppSelector } from '@store/store';
import React, { FC, useEffect, useRef, useState } from 'react';
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

    const {isOpen} = useAppSelector(state => state.searchFilter)

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

    const mainElement = useRef<HTMLDivElement>(null)
    const headerElement = useRef<HTMLDivElement>(null)
	const [heightToSet, setheightToSet] = useState('100%')
	
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