import React, { FC, useState } from 'react';
import { Input } from '@entities/input/input';
import { Button } from '@entities/button/button'
import { useGetShareUrlMutation } from '@api/filesApi';
import { SelectorMulti } from '@entities/selectors/selectorMulti/selectorMulti';
import { Option } from '@models/additional'
import { AccessRights } from '@models/searchParams';
import { MultiValue } from 'react-select';

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

const useCopyState = (): [boolean, () => void] => {
    const [isCopied, setCopied] = useState(false)

    return [isCopied, (): void => {
        setTimeout(() => setCopied(false), 200)
        setCopied(true)
    }]
}

export const Shared: FC<SharedProps> = ({
    dirPath,
    className,
}) => {
    const [currentEmail, setCurrentEmail] = useState('')
    const [emails, setEmail] = useState([] as string[])
    const [accessType, setAccessType] = useState('writer' as AccessRights)
    const [share, resp] = useGetShareUrlMutation()
    const [isCopied, setCopied] = useCopyState()

    return (
        <div className={['text-with-img', className].join(' ')}>
            <Input
                disabled={resp.isSuccess}
                onChange={(e) => setCurrentEmail(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key.toLowerCase() === 'enter') {
                        setEmail([...emails, currentEmail])
                    }
                }}
                placeholder={'Почты для доступа'}
                type={'email'}
                value={currentEmail}
            ></Input>
            <div>
                {emails.map((val) => {
                    return <div key={val}>{val}</div>
                })}
            </div>
            {resp.data ? <div>
                <p>Ссылка:</p>
                <p onClick={() => {
                    setCopied()
                    navigator.clipboard
                        .writeText(`${process.env.protocol}://${process.env.adress}` +
                            resp.data.body.share_link)
                }}>
                    {resp.data.body.share_link}
                </p>
                {isCopied ? <div style={{ position: 'absolute' }}>Copied!</div> : null}
            </div>
                : null}
            <SelectorMulti
                isMulti={false}
                options={[
                    { label: 'Редактор', value: 'writer' },
                    { label: 'Читатель', value: 'reader' }
                ]}
                defaultValue={{ label: 'Редактор', value: 'writer' }}
                onChange={(newValue: string[]) => {
                    switch (getValFromOption(newValue)) {
                        case 'writer':
                            setAccessType('writer');
                            break;
                        default:
                            setAccessType('reader');
                    }
                }
                }
            />
            <Button
                buttonText='Поделиться'
                variant={'contained'}
                disabled={resp.isLoading}
                clickHandler={(event) => {
                    event.stopPropagation();
                    share({
                        access_type: accessType,
                        by_emails: emails.length > 0 ? true : false,
                        dir: dirPath,
                        emails: emails,
                    })
                }}
            />

        </div >
    );
};
