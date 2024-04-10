import { TextWithImg } from "@feature/textWithImg/textWithimg";
import { DiskType, diskTypes, isDiskType } from "@models/disk";
import { ConnectedClouds } from "@models/user";
import { FC, useState } from "react";
import { Modal } from '@feature/modal/modal';
import InfoIcon from '@mui/icons-material/Info';
import { SelectorMulti } from '@entities/selectors/selectorMulti/selectorMulti';
import { Option } from '@models/additional';
import { Typography } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';

const isSelectedDisk =
    (disk: ConnectedClouds, selectedDisk: ConnectedClouds[]): boolean => {
        return !!selectedDisk.find(val => val.cloud_email === disk.cloud_email
            && val.disk === disk.disk
        )
    }

export interface TextWithImgProps {
    selected: boolean,
    disk: DiskType,
    cloudValues: ConnectedClouds[],
    setState: (text: diskTypes | ConnectedClouds) => void,
    selectedCloud: ConnectedClouds[],
    selectCloud: (cloud: ConnectedClouds) => void,
    refreshDisk: (cloud: ConnectedClouds) => void,
}

export const TextWithImgAndModal: FC<TextWithImgProps> = (
    {
        selected,
        disk,
        cloudValues,
        setState,
        selectedCloud,
        selectCloud,
        refreshDisk,
    }
): React.ReactNode => {
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
                    setState(diskName as diskTypes);
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
                            setState(cloudValues
                                .find(val => val.cloud_email === newValues[0]));
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