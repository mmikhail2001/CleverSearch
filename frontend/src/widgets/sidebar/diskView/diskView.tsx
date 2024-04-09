import { Modal } from '@feature/modal/modal';
import { TextWithImg } from '@feature/textWithImg/textWithimg';
import { isNullOrUndefined } from '@helpers/isNullOrUndefined';
import { DiskType, diskImgSrc, diskTypes, diskVal, isDiskType, toDiskType } from '@models/disk';
import { ConnectedClouds } from '@models/user';
import { useAppSelector } from '@store/store';
import React, { FC, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import InfoIcon from '@mui/icons-material/Info';
import { SelectorMulti } from '@entities/selectors/selectorMulti/selectorMulti';
import { Option } from '@models/additional';
import { selectCloud } from '@store/userDisks';
import { Typography } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';

const isSelectedDisk =
    (disk: ConnectedClouds, selectedDisk: ConnectedClouds[]): boolean => {
        return !!selectedDisk.find(val => val.cloud_email === disk.cloud_email
            && val.disk === disk.disk
        )
    }

const getTextWithImg = (
    selected: boolean,
    disk: DiskType,
    cloudValues: ConnectedClouds[],
    setState: (text: diskTypes) => void,
    selectedCloud: ConnectedClouds[],
    selectCloud: (cloud: ConnectedClouds) => void,
    refreshDisk: (cloud: ConnectedClouds) => void,
) => {
    if (isNullOrUndefined(disk)) return null

    const [isOpen, setOpen] = useState<boolean>(false)
    const { src, altText, diskName } = disk;

    const transformToOption = (cloudEmail: string): Option => {
        return {
            label: cloudEmail,
            value: cloudEmail,
        }
    }

    const currentDiskSelected = selectedCloud
        .filter(val => isSelectedDisk(val, selectedCloud))
        .filter(val => val.disk === diskName)

    return (
        <>
            <TextWithImg
                key={diskName + src}
                className={[selected ? 'selected' : '', 'text-with-img-row'].join(' ')}
                text={diskName}
                imgSrc={src}
                altImgText={altText}
                onClick={() => {
                    if (isDiskType(diskName)) {
                        setState(diskName as diskTypes);
                    }
                }}
            />
            <InfoIcon onClick={() => setOpen(true)} />
            <RefreshIcon onClick={() => refreshDisk(currentDiskSelected[0])} />
            <Typography fontSize={'var(--ft-small-text)'}>
                {currentDiskSelected.map(val => val.cloud_email)}
            </Typography>
            <Modal
                isOpen={isOpen}
                closeModal={() => setOpen(false)}
                children={<div>
                    <SelectorMulti
                        isMulti={false}
                        options={cloudValues
                            .map(val => transformToOption(val.cloud_email))
                        }
                        onChange={(newValues): void => {
                            if (isDiskType(diskName)) {
                                setState(diskName as diskTypes);
                            }
                            selectCloud(
                                cloudValues
                                    .find(val => val.cloud_email === newValues[0])
                            )
                        }} />
                </div>}
            />
        </>
    );
};

interface DiskViewProps {
    setSelectedState: (text: diskTypes) => void;
    nameOfSelectedDisk: diskTypes,
    needSelect: boolean,
}

export const DiskView: FC<DiskViewProps> = ({
    setSelectedState,
    nameOfSelectedDisk,
    needSelect,
}) => {
    const dispatch = useDispatch();
    const disks = useAppSelector(state => state.disks)

    const disksToShow = disks.clouds
        .map(
            val =>
                getTextWithImg(
                    nameOfSelectedDisk === val.disk && needSelect,
                    diskImgSrc.get(val.disk),
                    disks.clouds,
                    setSelectedState,
                    disks.selectedClouds,
                    (cloud) => {
                        dispatch(selectCloud(cloud))
                    },
                    () => console.log("MAKE REFRESH") //TODO
                )
        )
    const allDiskInfo = diskImgSrc.get('all')
    disksToShow.push(
        <TextWithImg
            key={allDiskInfo.diskName + allDiskInfo.src}
            className={
                [nameOfSelectedDisk === allDiskInfo.diskName && needSelect
                    ? 'selected'
                    : '', 'text-with-img-row'
                ].join(' ')
            }
            text={allDiskInfo.diskName}
            imgSrc={allDiskInfo.src}
            altImgText={allDiskInfo.altText}
            onClick={() => {
                if (isDiskType(allDiskInfo.diskName)) {
                    setSelectedState(allDiskInfo.diskName as diskTypes);
                }
            }}
        />
    )

    return (
        <div className="disk-show">
            <h2 className="disk-show-label">Ваши диски</h2>
            <div className="disks">{disksToShow}</div>
        </div>
    )
};
