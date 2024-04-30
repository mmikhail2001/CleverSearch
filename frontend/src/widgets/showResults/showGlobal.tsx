import { useAppSelector } from '@store/store';
import React, { FC, useEffect, useRef, useState } from 'react';

import { useDeleteFileMutation } from '@api/filesApi';
import { BreadCrumps } from '@entities/breadCrumps/breadCrumps';
import { RenderFields } from '@widgets/renderFields/renderFields';
import { useNavigate } from 'react-router-dom';
import { fileFile } from '@models/files';
import { diskTypes } from '@models/disk';
import { ConnectedClouds } from '@models/user';

import './show.scss'

type DirFunction = (dir: string, index: number) => () => void;

interface ShowGlobalFilesProps {
    getValue: () => void;
    whatShow: boolean;
    switchToWhatShow: () => void;
    firstElementInBreadCrumbs: string;
    dirs: string[];
    breadCrumbsReactions: DirFunction[] | DirFunction,
    data?: fileFile[],
    error?: any;
    isError: boolean,
    isLoading: boolean,
    openFolder: (dirToShow: string[], diskToShow: diskTypes | ConnectedClouds) => void,
}

export const ShowGlobal: FC<ShowGlobalFilesProps> = ({
    getValue,
    whatShow,
    switchToWhatShow,
    firstElementInBreadCrumbs,
    dirs,
    breadCrumbsReactions,
    data,
    error,
    isError,
    isLoading,
    openFolder,
}) => {
    const navigate = useNavigate();
    
    const mainElement = useRef<HTMLDivElement>(null)
    const headerElement = useRef<HTMLDivElement>(null)
    const [heightToSet, setheightToSet] = useState('100%')

    const {isOpen} = useAppSelector(state => state.searchFilter)

    const [deleteFile] = useDeleteFileMutation();

    if (!whatShow) {
        switchToWhatShow()
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
                    dirs={[firstElementInBreadCrumbs, ...dirs]}
                    reactOnElements={
                        [firstElementInBreadCrumbs, ...dirs].map((dir, index) => {
                            if (Array.isArray(breadCrumbsReactions)) {
                                return breadCrumbsReactions[index](dir, index)
                            } else {
                                return breadCrumbsReactions(dir, index)
                            }
                        })
                    }
                />
            </div>
            <RenderFields
                height={heightToSet}
                data={data}
                error={error}
                isError={isError}
                isLoading={isLoading}
                deleteFile={
                    (fileName: string): void => {
                        deleteFile([fileName]);
                        setTimeout(() =>{
                            getValue()
                        },
                            100)
                        }
                    }
                openFolder={openFolder}
            />
        </div>
    );
};
