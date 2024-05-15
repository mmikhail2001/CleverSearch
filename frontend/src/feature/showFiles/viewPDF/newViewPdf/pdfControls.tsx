import { IconButton, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

import AddRoundedIcon from '@mui/icons-material/AddRounded';
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded';
import { Input } from '@entities/input/input';

import { FC, useEffect, useState } from "react"

export interface PdfControlsProps {
    zoomOut: () => void, 
    zoomIn: ()=>void, 
    scale: number,
    changePage: (page: number) => void,
    currentPage: number,
    maxPage: number,
}

export const PdfControls: FC<PdfControlsProps> = ({
    zoomOut,
    zoomIn,
    scale,
    changePage,
    currentPage,
    maxPage,
}) => {
    const [pageToSelect, setpageToSelect] = useState(String(currentPage))    

    const handleChangePage = (e:React.ChangeEvent<HTMLInputElement>) => {
      const pageToSet = e.target.value
      
      setpageToSelect(pageToSet)
    }

    useEffect(() => {
      setpageToSelect(String(currentPage))
    }, [currentPage])
  
    const enterKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key.toLowerCase() === 'enter') {
        if (!Number(pageToSelect)) return

        if (Number(pageToSelect) > maxPage) {
          changePage(maxPage)
        } else {
          changePage(Number(pageToSelect))
        }
      }
    }

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <div style={{
          display: 'flex',
          fontSize: 'var(--ft-body)',
          alignItems: 'center',
          borderRadius: 'var(--small-radius) var(--small-radius) 0 0',
          paddingRight: '16px',
          paddingLeft: '16px',
          width: '100%',
          justifyContent: 'center',
          gap: '16px',
        }}>
          <div className='modal-page-number' style={{
            display: 'flex',
            flexDirection: 'row',
            height: '100%',
            alignItems: 'center',
            paddingRight: 'var(--big-padding)',
            paddingLeft: 'var(--big-padding)',
            borderRadius: "var(--small-radius)",
            background: 'rgba(53,53,53,0.9)',
          }}>
            <Input
              onChange={handleChangePage}
              onKeyDown={enterKeyPress}
              value={pageToSelect}
              placeholder={String(currentPage)}
              disabled={false}
              type={'text'}
              isFullWidth={false }
              border={'none'}
              style={{
                width: '20px',
              }}
              removeFocusedBorder={true}
              fontSize='var(--ft-body)'
            >
            </Input>
            <Typography sx={{
                display: 'flex',
                flexDirection: 'row',
                width: 'fit-content',
                height: '20px',
              }}
              fontSize={'inherit'}
              >
                / {maxPage}
              </Typography>
          </div>
          <div className="modal-scale" style={{
              paddingLeft: 'var(--normal-padding)',
              paddingRight: 'var(--normal-padding)',
              borderRadius: "var(--small-radius)",
              background: 'rgba(53,53,53,0.9)',
          }}>
            <IconButton 
              onClick={() => zoomOut()}
              sx={{color:'black'}}
            >
              <AddRoundedIcon sx={{color:'inherit', borderRadius: 'var(--big-radius)', backgroundColor: 'rgba(255,255,255,0.3)'}} />
            </IconButton>
            <Typography fontSize={'var(--ft-body)'}>{scale}</Typography>
            <IconButton 
              onClick={() => zoomIn()}
              sx={{color:'black'}}
            >
              <RemoveRoundedIcon sx={{color:'inherit', borderRadius: 'var(--big-radius)', backgroundColor: 'rgba(255,255,255,0.3)'}}/>
            </IconButton>
          </div>
        </div>
      </div>
    )
  }
  