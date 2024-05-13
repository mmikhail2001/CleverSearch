import { Notify } from '@models/ws';
import { addNewFiles } from '@store/fileProcess';
import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';

const reconnectTimeout = 2000;
const pingStatusTimeout = 3000;


export const useWebSocket = () => {
    const dispatch = useDispatch();
    const reconnectTimeoutRef = useRef<NodeJS.Timeout>(null);
    const pingIntervalRef = useRef<NodeJS.Timeout>(null);

    useEffect(() => {
        let ws: WebSocket = null;

        let lastPing: number = 0
        let lastPong: number = 0

        const wsSecure = process.env.wsAdress !== 'localhost' ? 'wss' : 'ws';
        const connect = () => {
            ws = new WebSocket(`${wsSecure}://${process.env.wsAdress}/api/ws`);

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
                console.info('WS: receive', event)
                const jsonMsg = JSON.parse(msg.data)
                let transfromMSG:Notify;

                if ('event' in jsonMsg && 'file' in jsonMsg) {
                    transfromMSG = jsonMsg
                } else {
                    return
                }

                switch (transfromMSG.event) {
                    case 'changeStatus': 
                        dispatch(addNewFiles([transfromMSG.file]))
                        break;
                    case "PONG":
					    lastPong = new Date().getTime();
                        ping()
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
                    connect();
                }, reconnectTimeout);
            }
        };

        const ping = () => {
            lastPing = new Date().getTime();
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ event: 'PING' }));
            }
        }

        const startPingPong = () => {
            pingIntervalRef.current = setInterval(() => {
                if (ws.readyState === WebSocket.OPEN) {
                    if (lastPing > lastPong) {
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
    }, []);
};