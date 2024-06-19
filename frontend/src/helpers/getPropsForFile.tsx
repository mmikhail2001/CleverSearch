import { diskTypes } from "@models/disk";
import { fileFile } from "@models/files";
import { ConnectedClouds } from "@models/user";
import { Modal } from '@feature/modal/modal';
import { ViewImg } from '@feature/showFiles/viewImg/viewImg';
import { ViewPDF } from '@feature/showFiles/viewPDF/pdfViewer';
import { VideoPlayer } from '@feature/videoPlayer/videoPlayer';

import ImageIcon from '@mui/icons-material/Image';
import FolderIcon from '@mui/icons-material/Folder';
import ArticleRoundedIcon from '@mui/icons-material/ArticleRounded';
import VideoFileRoundedIcon from '@mui/icons-material/VideoFileRounded';

import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';

import React from 'react';
import { useMobile } from "src/mobileProvider";

export interface renderReturns {
	renderModal: () => React.ReactNode | null;
	clickHandler: () => void;
	imgSrc: string | React.ReactNode;
}

export const getDirProps = (
    file: fileFile, 
    openFolder: (dirToShow: string[], diskToShow: diskTypes | ConnectedClouds) => void,
): renderReturns => {
    const imgSrc = <FolderIcon fontSize='inherit' sx={{color: "#DB9713"}} />;
    const clickHandler = () => {
        const dirsPath = file.path.split('/')
        let disk: diskTypes | ConnectedClouds = 'internal';
        if (file.cloud_email !== '') {
            disk = {
                cloud_email:file.cloud_email, 
                disk: file.disk,
                access_token: '',
            }
        }
        
        openFolder(dirsPath, disk);
    };
    const renderModal = (): null => null
    return { imgSrc, clickHandler, renderModal }
};

export const getImageProps = (
    file: fileFile, 
    state: boolean, 
    changeState: (whatToState: boolean) => void,
): renderReturns => {
    const renderModal = () => {
        return (
            <Modal 
                className={'modal__img-show'}
                styleOnModal={{
                    background: 'transparent',
                    borderRadius:'15px',
                    border: "nono",
                    color:'inherit',
                }}
                stylesOnContentBackground={{
                    padding: '0px',
                    overflow:'hidden',
                }}
                isOpen={state}
                closeModal={() => changeState(false)}
            >
                <div style={{
                    position: 'absolute',
                    top: '27px',
                    right: '24px',
                    fontSize: 'var(--ft-paragraph)',
                }}
                onClick={() => changeState(false)}
                >
                    <CloseOutlinedIcon fontSize="inherit"></CloseOutlinedIcon>
                </div>
                <ViewImg imgSrc={file.link} altText={''}/>
            </Modal>
        )
    }
    const imgSrc = <ImageIcon fontSize='inherit' sx={{color:'#0A9542'}}/>;
    const clickHandler = (): null => null;
    return { clickHandler, imgSrc, renderModal }
};

export const getPdfProps = (
    file: fileFile, 
    state: boolean, 
    changeState: (whatToState: boolean) => void,
): renderReturns => {
    const {whatDisplay} = useMobile()

    const renderModal = () => {
        return (
            <Modal
                isFullWidth={whatDisplay !== 1}
                className={'modal__pdf-show'}
                isOpen={state}
                closeModal={() => changeState(false)}
                bodyClassName={'modal-body__pdf'}
                isFullHeight={true}
                styleOnModal={{
                    background: 'transparent',
                    borderRadius:'15px',
                    boxShadow: 'none',
                    border: 'none',
                    color:'inherit',
                    minWidth: whatDisplay !== 1 ? '330px' : null,
                }}
                stylesOnContentBackground={{
                    overflow:'hidden',
                    height:'100dvh',
                    justifyContent: 'start',
                }}
            >
                <div style={{
                    position: 'absolute',
                    top: '27px',
                    right: '24px',
                    fontSize: 'var(--ft-paragraph)',
                }}
                onClick={() => changeState(false)}
                >
                    <CloseOutlinedIcon fontSize="inherit"></CloseOutlinedIcon>
                </div>
                <ViewPDF
                    pdfURL={file.link}
                    openPageInPDF={Array.isArray(file.page_number) ? file.page_number : [file.page_number] || [0]}
                />
            </Modal>
        )
    }

    const imgSrc = <ArticleRoundedIcon fontSize='inherit' sx={{color: "#4285F4"}} />;

    return { clickHandler: () => { }, imgSrc, renderModal }
};

export const getVideoProps = (
    file: fileFile, 
    state: boolean, 
    changeState: (whatToState: boolean) => void,
): renderReturns => {
    const renderModal = () => {
        return (
            <Modal 
                className={'modal__video-show'} 
                isOpen={state} 
                closeModal={() => changeState(false)}
                styleOnModal={{
                    background: 'transparent',
                    borderRadius:'15px',
                    border: "nono",
                    color:'inherit',
                }}
                stylesOnContentBackground={{
                    overflow:'hidden',
                }}
            >
                <VideoPlayer
                    isAudio={file.file_type === 'audio'}                
                    url={file.link}
                    duration={file.duration || 0}
                    start_time={Array.isArray(file.timestart) ? file.timestart : [file.timestart] || [0]}
                ></VideoPlayer>
            </Modal>
        )
    }
    
    const imgSrc = <VideoFileRoundedIcon fontSize='inherit' sx={{color: "#711CB4"}} />;
    return { clickHandler: () => { }, imgSrc, renderModal }
};