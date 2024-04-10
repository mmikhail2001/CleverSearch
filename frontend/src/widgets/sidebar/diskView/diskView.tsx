import { TextWithImg } from '@feature/textWithImg/textWithimg';
import { diskImgSrc, diskTypes, isDiskType } from '@models/disk';
import { useAppSelector } from '@store/store';
import { selectCloud } from '@store/userDisks';
import React, { FC } from 'react';
import { useDispatch } from 'react-redux';
import { TextWithImgAndModal } from './textWithImgAndModal/textWithImgAndModal';



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
            val => {
                return <TextWithImgAndModal
                    key={val.cloud_email + val.disk}
                    selected={nameOfSelectedDisk === val.disk && needSelect}
                    disk={diskImgSrc.get(val.disk)}
                    cloudValues={disks.clouds}
                    setState={setSelectedState}
                    selectedCloud={disks.selectedClouds}
                    selectCloud={(cloud) => {
                        dispatch(selectCloud(cloud))
                    }}
                    refreshDisk={() => console.log("MAKE REFRESH")} //TODO
                />
            }
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
                setSelectedState(allDiskInfo.diskName as diskTypes);
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
