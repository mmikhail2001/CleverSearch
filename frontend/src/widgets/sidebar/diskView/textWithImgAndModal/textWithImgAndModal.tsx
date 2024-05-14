import { TextWithImg } from '@feature/textWithImg/textWithimg';
import { DiskType, diskTypes } from '@models/disk';
import { ConnectedClouds } from '@models/user';
import React,{ FC, useRef, useState } from 'react';
import { Modal } from '@feature/modal/modal';
import { SelectorMulti } from '@entities/selectors/selectorMulti/selectorMulti';
import { Option } from '@models/additional';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useMobile } from 'src/mobileProvider';
import CSS from 'csstype'
import { isNullOrUndefined } from '@helpers/isNullOrUndefined';
import { DropDown } from '@entities/dropDown/dropDown';
import { useAppSelector } from '@store/store';

const isSelectedDisk =
    (disk: ConnectedClouds, selectedDisk: ConnectedClouds[]): boolean => {
        return !!selectedDisk.find(val => val.cloud_email === disk.cloud_email
            && val.disk === disk.disk
        )
    }

export interface TextWithImgAndDropDownProps {
    selected: boolean,
    disk: DiskType,
    cloudValues: ConnectedClouds[],
    setState: (text: diskTypes | ConnectedClouds) => void,
    selectedCloud: ConnectedClouds[],
    selectCloud: (cloud: ConnectedClouds) => void,
    refreshDisk: (cloud: ConnectedClouds) => void,
    currentSelectedDisk: string,
    isRefreshShow?: boolean,
}

export const TextWithImgAndDropDown: FC<TextWithImgAndDropDownProps> = (
    {
        selected,
        disk,
        cloudValues,
        setState,
        selectedCloud,
        selectCloud,
        refreshDisk,
        currentSelectedDisk,
        isRefreshShow,
    }): React.ReactNode => {
        const [isOpen, setOpen] = useState<boolean>(false)
        
        const {isExternal} = useAppSelector(state => state.whatToShow)

        const { src, altText, diskName } = disk;
        const ref = useRef(null)
        const {whatDisplay} = useMobile()
        const isMobile = whatDisplay === 2
        
        const handleOpen = (state: boolean):void => {
            if (!state) setOpen(state)

            if (isExternal) {
                setOpen(state)
            }
        }

        const showRefresh = isNullOrUndefined(isRefreshShow) ? 'true' : isRefreshShow
        
        const refSize = useRef<HTMLDivElement>(null)

        const transformToOption = (cloudEmail: string): Option => {
            return {
                label: cloudEmail,
                value: cloudEmail,
            }
        }

        const currentDiskSelected: ConnectedClouds[] = selectedCloud
            .filter(val => isSelectedDisk(val, selectedCloud))
            .filter(val => val.disk === diskName)

        const emailsInDisk = cloudValues.filter(val => val.disk === disk.diskName).map(val => val.cloud_email)
        const emailSelectCloud = currentDiskSelected?.filter(val => val.cloud_email !== '')

        let cssForSelectorWithEmail: CSS.Properties;
        if (isMobile) {
            cssForSelectorWithEmail = {
                maxWidth: refSize.current ? `calc(${refSize.current.clientWidth}px + 0.25rem)` : '212px',
                width: '100%',
                overflow: 'auto',
            }
        }

        const mainElementToRender = ():React.ReactNode => {
            return (
                <TextWithImg
                key={`${diskName}__${src}`}
                className={[selected ? 'selected' : '', 'text-with-img-row'].join(' ')}
                text={diskName.toLowerCase()}
                imgSrc={src}
                altImgText={altText}
                onClick={(e) => {
                    if (e.target === ref.current) return
                    if (emailSelectCloud.length > 0) {
                        setState(
                            {
                                disk: diskName,
                                access_token: emailSelectCloud[0].access_token,
                                cloud_email: emailSelectCloud[0].cloud_email,
                            } as ConnectedClouds);
                    }

                    if (emailsInDisk.length === 1) {
                        setState(cloudValues
                            .find(val => val.cloud_email === emailsInDisk[0]));
                        selectCloud(
                            cloudValues
                                .find(val => val.cloud_email === emailsInDisk[0])
                        )
                        return
                    }

                    if (currentDiskSelected.length === 0) {
                        setOpen(true)
                    }

                    if (emailSelectCloud[0] && currentSelectedDisk === emailSelectCloud[0].disk)
                        setOpen(true)
                }}
                rightIconProp={
                    showRefresh ? 
                    <RefreshIcon ref={ref}  onClick={(e) => {
                        e.stopPropagation()
                        refreshDisk(currentDiskSelected[0])
                    } }/>
                    : null
                }
            />
            )
        } 

        return (
            <>
                <DropDown
                    removeShadow={true}
                    mainElement={mainElementToRender()}
                    toggleOpen={handleOpen}
                    open={isOpen}
                    borderRadius='small'
                    isCloseOnSelect={true}
                    variants='down'
                    isSameSize={true}
                >
                    {[<div style={{ 
                            width: isMobile ? '100%' :'250px' ,
                            height: '30px',
                        }}
                        ref={refSize}
                        key={'container--select-disk'}
                    >
                        <SelectorMulti
                            height='30px'
                            menuStyle={cssForSelectorWithEmail}
                            defaultValue={emailSelectCloud[0] ? [transformToOption(emailSelectCloud[0].cloud_email)] : null}
                            isMulti={false}
                            options={cloudValues
                                .map(val => transformToOption(val.cloud_email))
                            }
                            fontSize="var(--ft-body)"
                            onChange={(newValues): void => {
                                setState(cloudValues
                                    .find(val => val.cloud_email === newValues[0]));
                                selectCloud(
                                    cloudValues
                                        .find(val => val.cloud_email === newValues[0])
                                )
                            }} />
                    </div>]}
                </DropDown>
            </>
        );
};