import React, { FC, useEffect, useRef, useState } from 'react';
import { Input } from '@entities/input/input';
import { Button } from '@entities/button/button'
import { useGetShareUrlMutation } from '@api/filesApi';
import { SelectorMulti } from '@entities/selectors/selectorMulti/selectorMulti';
import { AccessRights, sharedType } from '@models/searchParams';
import List from '@mui/joy/List';
import ListItem from '@mui/joy/ListItem';
import { Typography } from '@mui/material';
import {Option} from '@models/additional'

import CloseIcon from '@mui/icons-material/Close';

import './shared.scss'
import { Switch } from '@entities/switch/switch';
import { notificationBar } from '@helpers/notificationBar';
import { useEmailCheckMutation } from '@api/userApi';

interface SharedProps {
    dirPath: string,
    className: string;
}

const getValFromOption = (newVal: string[]): string => {
    if ('length' in newVal) {
        return newVal.map((val) => val).join('');
    }
    if (newVal) return newVal;
    return 'reader';
}

const getOptionFromVal = (val: string): Option => {
    switch(val) {
        case 'writer':
            return  { label: 'Редактор', value: 'writer' } as Option
        case 'reader':
            return { label: 'Читатель', value: 'reader' } as Option
        default:
            return { label: 'Редактор', value: 'writer' } as Option
    }
}

const useCopyState = (): [boolean, () => void] => {
    const [isCopied, setCopied] = useState(false)

    return [isCopied, (): void => {
        setTimeout(() => setCopied(false), 400)
        setCopied(true)
    }]
}

const getEmailShow = (
    emails: string[],
    setEmails: (emails: string[]) => void,
    isCanBeDeleted: boolean,
    incorrectEmails: string[]
): React.ReactNode => {
    if (emails.length === 0) {
        return null
    }
    return (
        <div style={{ width: '100%' }}>
            <Typography fontSize={'var(--ft-body)'}>
                Access given:
            </Typography>
            <List
                className='email-list'
                style={{
                    maxHeight: 'calc(3 * calc(var(--ft-body) + 2.6rem))',
                    overflowY: 'auto',
                    color:"inherit",
                    gap: "8px",
                    display: 'flex',
                }}
            >
                {emails.map(val => (
                    <ListItem
                        key={`${val}_list`}
                        className={ !!incorrectEmails.find(incorrectEmail => val === incorrectEmail) ?
                            'email-list__item-incorrect'
                            :'email-list__item'
                        }
                        sx={{
                            borderRadius: 'var(--small-radius)',
                            color: 'inherit',
                        }}
                    >
                        <div style={{
                                width: '100%',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                            }}
                        >
                            <Typography sx={{
                                    maxWidth: '100%',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    textWrap: 'nowrap',
                            }}
                                fontSize={'inherit'}
                            >
                                    {val}
                            </Typography>
                            {isCanBeDeleted 
                            ? <CloseIcon 
                                sx={{cursor: 'pointer'}}
                                onClick={() => {
                                    setEmails(emails.filter(emailVal => emailVal !== val))
                                }}
                            />
                            : null
                            }
                        </div>
                    </ListItem>
                ))}
            </List>
        </div> 
    )
}


export const Shared: FC<SharedProps> = ({
    dirPath,
    className,
}) => {
    const [currentEmail, setCurrentEmail] = useState<string>('')
    const [emails, setEmail] = useState([] as string[])
    const [accessType, setAccessType] = useState<AccessRights>('reader' as AccessRights)
    const [isCopied, setCopied] = useCopyState()

    const [isResponseCorrect, setResponseCorrect] = useState(false)
    
    const [incorrectEmails, setIncorrectEmails] = useState([] as string[])
    
    const [shareByEmail, setShareByEmail] = useState<boolean>(false)
    
    const [share, resp] = useGetShareUrlMutation()
    const [checkEmails, respEmails] = useEmailCheckMutation()
    
    useEffect(() => {
        if(respEmails.isSuccess) {
            let respIncorrectEmails = respEmails.data.filter(val => !val.exists)
            
            if (respIncorrectEmails.length === 0) {
                notificationBar({
                    children: 'All emails correct',
                    variant: 'info'
                })
                setResponseCorrect(true)
                setIncorrectEmails([])
            } else {
                setResponseCorrect(false)
                setIncorrectEmails(respIncorrectEmails.map(val => val.email))
                
                notificationBar({
                    children: "Some emails is incorrect",
                    variant: 'error',
                })
            }
           
        }
    }, [respEmails])
    
    useEffect(() => {
        if(isResponseCorrect) {
            share({
                access_type: accessType,
                by_emails: shareByEmail,
                dir: dirPath,
                emails: emails,
            })
        }
    }, [isResponseCorrect])

    useEffect(() => {
        if (resp.isSuccess) {
            notificationBar({
                children: 'Share successful!',
                variant: 'success'
            })
        }
    }, [resp])

    return (
        <div className={['shared-modal', className].join(' ')} onClick={(e) => e.preventDefault()}>
            <div style={{width:'100%'}}>
                <Switch
                    fontSize='var(--ft-body)'
                    style={{
                        display:"flex",
                        justifyContent:"start",
                        color:'inherit',
                    }}
                    labelPlacement='start'
                    label='Share by email'
                    checked={shareByEmail} 
                    onChange={() => {setShareByEmail(!shareByEmail)}}
                    disabled={false}
                />
            </div>
            {shareByEmail ? 
            <>
                <div style={{display:'flex', flexDirection: 'row', gap: "8px", width: '100%'}}>
                    <Input
                        removeFocusedBorder={true}
                        isFullWidth={true}
                        disabled={false}
                        fontSize='var(--ft-body)'
                        onChange={(e) => {
                            e.preventDefault()
                            setCurrentEmail(e.target.value)
                        }
                        }
                        onKeyDown={(e) => {
                            if (e.key.toLowerCase() === 'enter') {
                                if (currentEmail === '') return
                                setEmail([...emails, currentEmail])
                                setCurrentEmail('')
                            }
                        }}
                        placeholder={'Emails'}
                        type={'email'}
                        value={currentEmail}
                        specificRadius={'small-radius'}
                    ></Input>
                    <Button
                        disabled={currentEmail === ''}
                        style={{width: '20%', color: 'inherit'}}
                        buttonText={'Add'} 
                        clickHandler={() => {
                            setEmail([...emails, currentEmail])
                            setCurrentEmail('')
                        }} 
                        variant={'text'}                        
                    />
                </div>
                {getEmailShow(emails, (newEmails) => setEmail(newEmails), true, incorrectEmails)}
            </>
            : null
            }
            
            <SelectorMulti
                removeFocusedBorder={true}
                height='44.38px'
                fontSize='var(--ft-body)'
                isMulti={false}
                borderRadius='small'
                options={[
                    { label: 'Writer', value: 'writer' },
                    { label: 'Reader', value: 'reader' }
                ]}
                defaultValue={[getOptionFromVal(accessType)]}
                onChange={(newValue: string[]) => {
                    switch (getValFromOption(newValue)) {
                        case 'reader':
                            setAccessType('reader');
                            break;
                        default:
                            setAccessType('writer');
                    }
                }
                }
            />
            
            <div style={{
                display: 'flex', 
                flexDirection: 'row', 
                justifyContent: 'space-between',
                height: '36px',
                width: '100%',
            }}>
                <Button
                    fontSize='var(--ft-body)'
                    buttonText='Copy'
                    variant={'text'}
                    style={{
                        color: 'inherit',
                    }}
                    disabled={!resp.isSuccess}
                    clickHandler={(event) => {
                        event.stopPropagation();
                        setCopied()
                        navigator.clipboard
                        .writeText(`${process.env.protocol}://${process.env.adress}` +
                        resp.data.body.share_link)
                        notificationBar({
                            children: 'Link copied!',
                            variant: 'success'    
                        })
                    }}
                />

                <Button
                    fontSize='var(--ft-body)'
                    buttonText='Share'
                    variant={'contained'}
                    disabled={resp.isLoading}
                    clickHandler={(event) => {
                        event.stopPropagation();
                        setEmail(currentEmail !== "" ? [...emails, currentEmail] : emails)

                        if (shareByEmail && emails.length === 0) {
                            notificationBar({children: 'Write email to share', variant: 'warning'})
                            return
                        }
                        if (shareByEmail) {
                            checkEmails(emails)
                        } else {
                            setResponseCorrect(true)
                        }
                    }}
                />
            
            </div>
        </div>
    );
};
