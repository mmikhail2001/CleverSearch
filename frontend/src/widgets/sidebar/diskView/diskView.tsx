import { TextWithImg } from '@feature/textWithImg/textWithimg';
import { diskImgSrc, diskTypes } from '@models/disk';
import { useAppSelector } from '@store/store';
import { selectCloud } from '@store/userDisks';
import React, { FC, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { TextWithImgAndModal } from './textWithImgAndModal/textWithImgAndModal';
import { useUpdateDiskMutation } from '@api/diskApi';
import { newValues } from '@store/showRequest';



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
    
    const showReq = useAppSelector(state => state.showRequest)
    const [refresh, refreshResp] = useUpdateDiskMutation()
    


    useEffect(() => {
        if (refreshResp.isSuccess &&  typeof showReq.disk !== 'string' && showReq.disk.disk === nameOfSelectedDisk) {
            dispatch(newValues({...showReq, disk: showReq.disk}))
        }

    }, [refreshResp])


    const alreadyShowed = [] as diskTypes[]
    const disksToShow = disks.clouds
        .map(
            val => {
                if (alreadyShowed.find(disk => disk === val.disk)) return
                alreadyShowed.push(val.disk)
                
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
                    currentSelectedDisk={typeof showReq.disk === 'string' ? showReq.disk : showReq.disk.disk}
                    refreshDisk={(disk) => {
                            refresh(disk)
                    }}
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
        <div className="disks">{disksToShow}</div>
    )
};
