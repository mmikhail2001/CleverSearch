import React, { FC, useRef, useState } from 'react';
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

const generatedLinkField = (isCopied:boolean, setCopied: () => void, navigator: Navigator, link:string): React.ReactNode => {
    return (
        <div>
            <p>Ссылка:</p>
            <p onClick={(e) => {
                e.preventDefault()
                setCopied()
                navigator.clipboard
                    .writeText(`${process.env.protocol}://${process.env.adress}` +
                    link)
            }}>
                {`${process.env.protocol}://${process.env.adress}` + link}
            </p>
            {isCopied ? <div style={{ position: 'absolute' }}>Ссылка скопирована в ваш буфер!</div> : null}
        </div>)
}

const getSharedSuccess = (
    isLoading:boolean, 
    isCopied: boolean, 
    setCopied: () => void,
    link: string,
    accessType: AccessRights,
    emails: string[],
):React.ReactNode => {
    let accessShowOut = accessType === 'writer' ? 'Writer' : 'Reader'
    return <div style={{display:"flex", gap:'1rem', flexDirection: 'column'}}>
        <Typography fontSize={'var(--ft-body)'}>
            Role given: {accessShowOut}
        </Typography>
        {getEmailShow(emails, () => {}, false)}
        {generatedLinkField(isCopied,setCopied, navigator, link)}
        <div style={{
            width:"100%", 
            justifyContent:'center', 
            display: 'flex',
            paddingTop: '1rem',
        }}>
            <Button
                fontSize='var(--ft-body)'
                buttonText={isCopied ? "Copied" : "Copy"}
                variant={'contained'}
                disabled={isLoading}
                clickHandler={() => {
                        setCopied()
                        navigator.clipboard
                        .writeText(`${process.env.protocol}://${process.env.adress}` +
                        link)
                }}
            />
        </div>
    </div>
}

const getEmailShow = (
    emails: string[],
    setEmails: (emails: string[]) => void,
    isCanBeDeleted: boolean,
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
                marker={'disc'}
                style={{
                    maxHeight: 'calc(3 * calc(var(--ft-body) + 0.2rem))',
                    overflowY: 'auto',
                    color:"inherit",
                }}
            >
                {emails.map(val => (
                    <ListItem 
                        sx={{
                            fontSize: 'var(--ft-body)',
                            width: '100%',
                            color:"inherit",
                        }}
                    >
                        <div style={{
                                width: '100%',
                                display: 'flex',
                                justifyContent: 'space-between',
                            }}
                        >
                            {val}
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
    const [share, resp] = useGetShareUrlMutation()
    const [isCopied, setCopied] = useCopyState()
    const [shareByEmail, setShareByEmail] = useState<boolean>(false)
    
    return (
        <div className={['shared-modal', className].join(' ')} onClick={(e) => e.preventDefault()}>
            {resp.isSuccess 
            ? getSharedSuccess(
                resp.isLoading, 
                isCopied, 
                setCopied, 
                resp.data.body.share_link, 
                accessType, 
                emails
            )
            :
            <>
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
                    <Input
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
                                setEmail([...emails, currentEmail])
                                setCurrentEmail('')
                            }
                        }}
                        placeholder={'Emails'}
                        type={'email'}
                        value={currentEmail}
                        specificRadius={'big-radius'}
                    ></Input>
                    {getEmailShow(emails, (newEmails) => setEmail(newEmails), true)}
                </>
                : null
                }
                <SelectorMulti
                    height='44.38px'
                    fontSize='var(--ft-body)'
                    isMulti={false}
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
                <Button
                    fontSize='var(--ft-body)'
                    buttonText='Share'
                    variant={'contained'}
                    disabled={resp.isLoading}
                    clickHandler={(event) => {
                        event.stopPropagation();
                        let emailsToSet = currentEmail !== "" ? [...emails, currentEmail] : emails
                        if (shareByEmail && emails.length === 0) {
                            // TODO make error
                            return
                        }
                        share({
                            access_type: accessType,
                            by_emails: shareByEmail,
                            dir: dirPath,
                            emails: emailsToSet,
                        })
                    }}
                />
            </>
            }
        </div>
    );
};
