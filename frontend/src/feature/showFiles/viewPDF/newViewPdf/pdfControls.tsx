import { IconButton, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

import AddRoundedIcon from '@mui/icons-material/AddRounded';
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded';
import { Input } from '@entities/input/input';

import { FC, useEffect, useState } from "react"
import KeyboardArrowUpOutlinedIcon from '@mui/icons-material/KeyboardArrowUpOutlined';
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined';

export interface PdfControlsProps {
    zoomOut: () => void, 
    zoomIn: ()=>void, 
    scale: number,
    changePage: (page: number) => void,
    currentPage: number,
    maxPage: number,
    searchPages?: number[],
}

export const PdfControls: FC<PdfControlsProps> = ({
    zoomOut,
    zoomIn,
    scale,
    changePage,
    currentPage,
    maxPage,
    searchPages,
}) => {
  const [pageToSelect, setpageToSelect] = useState(String(currentPage))    

  const [currentSelectedPage, setCurrentSelectedPage] = useState(0)

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

  const handleChangeSearchPage = (pageNumber: number) => {
    if (searchPages?.length <= pageNumber) {
      setCurrentSelectedPage(searchPages.length - 1)
      return
    }

    if (pageNumber < 0) {
      setCurrentSelectedPage(0)
      return
    }

    setCurrentSelectedPage(pageNumber)
    changePage(searchPages[pageNumber])
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
        marginRight: searchPages?.length > 0 ? '48px' : null,
      }}>
        <div className='modal-page-number' 
        style={{
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
              alignItems: 'center',
            }}
            fontSize={'inherit'}
          >
              {`/ ${maxPage}`}
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
        {
          searchPages?.length > 1 
          ? <div className='modal--search' style={{
            display: 'flex',
            flexDirection: 'row',
            height: '100%',
            alignItems: 'center',
            position: 'absolute',
            right: '8px',
          }}
          >
            <IconButton 
              onClick={() => handleChangeSearchPage(currentSelectedPage + 1)}
              sx={{color:'black'}}
              disabled={searchPages.length - 1 === currentSelectedPage}
            >
              <KeyboardArrowUpOutlinedIcon sx={{color:'inherit', borderRadius: 'var(--big-radius)', backgroundColor: 'rgba(255,255,255,0.3)'}}/>
            </IconButton>
            <Typography fontSize={'var(--ft-body)'}>{currentSelectedPage + 1}/{searchPages.length}</Typography>
            <IconButton 
              onClick={() => handleChangeSearchPage(currentSelectedPage - 1)}
              sx={{color:'black'}}
              disabled={currentSelectedPage === 0}
            >
              <KeyboardArrowDownOutlinedIcon sx={{color:'inherit', borderRadius: 'var(--big-radius)', backgroundColor: 'rgba(255,255,255,0.3)'}}/>
            </IconButton>
          </div>
          : null
        }
        
      </div>
    </div>
  )
}
  