import { Notify, events } from "@models/ws";
import { addNewFiles } from "@store/fileProcess";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

export const useWebsoket = () => {
    const dispatch = useDispatch()
    const [restartTimes, setRestartTimes] = useState<number>(0)

    useEffect(function() {
        console.log("RUNNNN")
        const connect = function(prevTimes: number) {
            const ws = new WebSocket(`ws://${process.env.wsAdress}/api/ws`);

            ws.onopen = (event) => console.info('WS: opened')
            ws.onerror = (event) => {
                console.info('WS: error', event)
                ws.close()
            }

            ws.onclose = function(event) {
                console.info('WS: closed', event,restartTimes)
                if (prevTimes > 5) {
                    return
                }
                setTimeout(function() {
                    connect(prevTimes + 1);
                }, 500);
            }

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
                    default: 
                        console.warn("WS: unknown event", transfromMSG.event)
                }
            }
        }
        connect(0)
   },[])
}