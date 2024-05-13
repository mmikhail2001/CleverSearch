import { TextWithImg } from '@feature/textWithImg/textWithimg';
import { useAppSelector } from '@store/store';
import React, { FC } from 'react';
import { useDispatch } from 'react-redux';
import { newValues } from '@store/showRequest';
import { useNavigate } from 'react-router-dom';

import RobotSVG from '@icons/Robot.svg';
import FavoriteIcon from '@mui/icons-material/Favorite';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import { switchToLoved, switchToProcessed, switchToShared } from '@store/whatToShow';
import { useMobile } from 'src/mobileProvider';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';

interface BottomButtonsProps {
}

export const BottomButtons: FC<BottomButtonsProps> = ({
}) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    const showReq = useAppSelector(state => state.showRequest)
    
    const { 
		isProccessed,
		isShared,
		isLoved,
	} = useAppSelector((state) => state.whatToShow);

    const {whatDisplay} = useMobile()
    const isMobile = whatDisplay !== 1

    return (
        <>
            <TextWithImg
                text="in process"
                className={['text-with-img', 'work-in-progress', isProccessed ? 'selected' : '', 'text-with-img-row'].join(' ')}
                imgSrc={<img src={RobotSVG} style={{color: 'inherit'}}/>}
                altImgText="Робот"
                onClick={() => {
                    dispatch(switchToProcessed());
                    dispatch(newValues({...showReq, disk: 'internal'}))
                    navigate('/uploaded')
                }}
            />
            <TextWithImg
                text="shared with me"
                className={['shared', isShared ? 'selected' : '', 'text-with-img-row'].join(' ')}
                imgSrc={<PeopleAltIcon />}
                altImgText="Картинка с двумя людьми"
                onClick={() => {
                    dispatch(switchToShared())
                    dispatch(newValues({...showReq, disk: 'internal'}))
                    navigate('/shared')
                }}
            />
            <TextWithImg
                text="favorites"
                className={['loved', isLoved ? 'selected' : '', 'text-with-img-row'].join(' ')}
                imgSrc={<FavoriteIcon sx={{color:"#FF4444", width:'var(--ft-paragraph)',height:'var(--ft-paragraph)'}}/>} 
                altImgText="Сердце"
                onClick={() => {
                    dispatch(switchToLoved())
                    navigate('/loved')
                }}
            />
            {isMobile ? 
            <TextWithImg
                text="settings"
                className={['settings-button', 'text-with-img-row'].join(' ')}
                imgSrc={<SettingsRoundedIcon sx={{color:"inherit", width:'var(--ft-paragraph)', height:'var(--ft-paragraph)'}}/>} 
                altImgText="Сердце"
                onClick={() => {
                    navigate('/settings')
                }}
            />
            :null}

        </>
    )
};
