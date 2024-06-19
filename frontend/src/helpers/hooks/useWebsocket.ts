import { Notify } from '@models/ws';
import { addNewFiles } from '@store/fileProcess';
import { useAppSelector } from '@store/store';
import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';

const reconnectTimeout = 3000;
const pingALiveCheckTimeout = 30000;
const pingStatusTimeout = 20000;

const wsSecure = process.env.wsAdress !== 'localhost' ? 'wss' : 'ws';

export const useWebSocket = () => {
    const dispatch = useDispatch();
    const reconnectTimeoutRef = useRef<NodeJS.Timeout>(null);
    const pingIntervalRef = useRef<NodeJS.Timeout>(null);

    const [ws, setWebsocket] = useState<WebSocket | null>(null)

    useEffect(() => {
        let lastPing: number = new Date().getTime()
        let lastPong: number = new Date().getTime()

        const connect = () => {
            if (ws === null) {
                setWebsocket(new WebSocket(`${wsSecure}://${process.env.wsAdress}/api/ws`))
                return 
            } 

            ws.onopen = () => {
                console.info('WS: connected');
                startPingPong();
            };

            ws.onerror = (error) => {
                console.error('WS: error', error);
                reconnect();
            };

            ws.onclose = () => {
                console.warn('WS: closed');
                reconnect();
            };

            ws.onmessage = (msg:MessageEvent<any>) => {
                const jsonMsg = JSON.parse(msg.data)
                let transfromMSG:Notify;

                if ('event' in jsonMsg && 'file' in jsonMsg) {
                    transfromMSG = jsonMsg
                } else {
                    console.info('WS: receive and cant recognize: ', event)
                    return
                }

                switch (transfromMSG.event) {
                    case 'changeStatus': 
                        console.info('WS: receive', event)
                        dispatch(addNewFiles([transfromMSG.file]))
                        break;
                    case "PONG":
                        lastPong = new Date().getTime();
                        break;
                    default: 
                        console.warn('WS: unknown event', transfromMSG.event)
                }
            }
        };

        const reconnect = () => {
            if (!reconnectTimeoutRef.current) {
                console.info('WS: reconnecting...');
                reconnectTimeoutRef.current = setTimeout(() => {
                    reconnectTimeoutRef.current = null;
                    setWebsocket(null)
                    connect();
                }, reconnectTimeout);
            }
        };

        const ping = () => {
            lastPing = new Date().getTime();
            
            if (ws.readyState === WebSocket.OPEN) {
                ws.send('PING');
            }
        }

        const startPingPong = () => {
            ping()
            pingIntervalRef.current = setInterval(() => {
                if (ws.readyState === WebSocket.OPEN) {
                    const pingTimeoutAgo = lastPing - pingALiveCheckTimeout;

                    if (pingTimeoutAgo > lastPong) {
                        clearInterval(pingIntervalRef.current);
                        ws.close()
                    }

                    ping()
                } else {
                    clearInterval(pingIntervalRef.current);
                }
            }, pingStatusTimeout);
        };

        connect();
        
        return () => {
            if (ws) {
                ws.close();
            }
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
            if (pingIntervalRef.current) {
                clearInterval(pingIntervalRef.current);
            }
        };
    }, [ws]);
};