import { useAppSelector } from '@store/store';
import React, { FC, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';

import { useDeleteFileMutation, useGetUploadedFilesMutation } from '@api/filesApi';
import { useNavigate } from 'react-router-dom';
import {  switchToProcessed } from '@store/whatToShow';
import { removeFiles } from '@store/fileProcess';
import { ShowGlobal } from '../showGlobal';
import { GetShowNoFilesErrorElement } from '@feature/errorElements';

interface ShowProcessedFilesProps { }


export const ShowProcessedFiles: FC<ShowProcessedFilesProps> = () => {
    const { isProccessed, whatDiskToShow } = useAppSelector(state => state.whatToShow)
    const navigate = useNavigate();

    const [show, showResp] = useGetUploadedFilesMutation({ fixedCacheKey: 'processed' });

    const {isOpen} = useAppSelector(state => state.searchFilter)

    const [deleteFile] = useDeleteFileMutation();
    const dispatch = useDispatch();

    const filesProcessed = useAppSelector(state => state.fileProcess)

    useEffect(() => {
        if (isProccessed) {
            show(null);
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
        <ShowGlobal
            errorElement={<GetShowNoFilesErrorElement/>}
            firstElementInBreadCrumbs='Uploaded'
            breadCrumbsReactions={() => { return () => { }; } }
            dirs={[]}
            getValue={() => show(null)}
            data={showResp.data?.body}
            error={showResp.error}
            isError={showResp.isError}
            isLoading={showResp.isLoading}
            openFolder={() => {
                return () => {}
            }}
            whatShow={isProccessed}
            switchToWhatShow={() => dispatch(switchToProcessed())}
        />
    )
};