import { NextFunction, Request, Response } from 'express';
import updateLanDeviceData from './public/updateLanDeviceData';
import _ from 'lodash';
import deviceDataUtil from '../utils/deviceDataUtil';
import logger from '../utils/logger';
import { decode } from 'js-base64';
import controlRequestMapClass from '../ts/class/controlRequestMap';
import dayjs from 'dayjs';

interface ReqData {
    directive: {
        header: {
            name: string;
            message_id: string;
            version: string;
        };
        endpoint: {
            serial_number: string;
            third_serial_number: string;
            tags: {
                deviceInfo: string;
            };
        };
        payload: {
            state: object;
        };
    };
}

/** 开放给ihost后端的接口，收到ihost后端请求，控制局域网设备 */
export default async function controlLanDevice(req: Request, res: Response, next: NextFunction) {
    const reqData = req.body as ReqData;
    const { header, endpoint, payload } = reqData.directive;
    const { message_id } = header;
    try {
        const iHostState = payload.state;
        const iHostDeviceData = JSON.parse(decode(endpoint.tags.deviceInfo));

        const { deviceId, devicekey, selfApikey } = iHostDeviceData;

        const state = deviceDataUtil.iHostStateToLanState(deviceId, iHostState);

        const uiid = deviceDataUtil.getUiidByDeviceId(deviceId);
        if (!uiid) {
            logger.error('控制设备的时候拿不到对应的uiid------------------------', uiid);
            return;
        }
        const toggleLength = deviceDataUtil.getToggleLenByUiid(uiid);
        let resData;
        let request: any;

        if (toggleLength > 0 || uiid === 77) {
            request = updateLanDeviceData.setSwitches;
        } else {
            request = updateLanDeviceData.setSwitch;
        }

        //将多个请求间隔发送控制设备，防止设备接收不了
        if (isNeedDelay(deviceId, iHostState)) {
            const toggle = _.get(iHostState, 'toggle') as any;
            logger.info('第几通道-------', Object.keys(toggle)[0]);
            const gapTime = (Number(Object.keys(toggle)[0]) - 1) * 600;
            logger.info('gapTime--------------------------------', gapTime);
            controlRequestMapClass.requestMap.set(deviceId, Date.now());

            setTimeout(async () => {
                logger.info('延时发送--------------------------------------------------------', deviceId);
                logger.info('请求时间--------------------------------------------------------');
                const resData = await request(deviceId, devicekey, selfApikey, state);

                //找不到这个设备
                if (!resData) {
                    // throw new Error(JSON.stringify(resData));

                    return res.json({
                        event: {
                            header: {
                                name: 'UpdateDeviceStatesResponse',
                                message_id,
                                version: '1',
                            },
                            payload: {},
                        },
                    });
                }

                if (resData && resData.error !== 0) {
                    throw new Error(JSON.stringify(resData));
                }
                return res.json({
                    event: {
                        header: {
                            name: 'UpdateDeviceStatesResponse',
                            message_id,
                            version: '1',
                        },
                        payload: {},
                    },
                });
            }, gapTime);
        } else {
            logger.info('直接发送--------------------------------------------------------', deviceId);
            controlRequestMapClass.requestMap.set(deviceId, Date.now());

            const resData = await request(deviceId, devicekey, selfApikey, state);

            //找不到这个设备
            if (!resData) {
                throw new Error(JSON.stringify(resData));
            }

            if (resData && resData.error !== 0) {
                throw new Error(JSON.stringify(resData));
            }
            return res.json({
                event: {
                    header: {
                        name: 'UpdateDeviceStatesResponse',
                        message_id,
                        version: '1',
                    },
                    payload: {},
                },
            });
        }
    } catch (error: any) {
        logger.error(`控制设备过程中代码执行错误: ---------------${error}`);

        return res.json({
            event: {
                header: {
                    name: 'ErrorResponse',
                    message_id,
                    version: '1',
                },
                payload: {
                    type: 'ENDPOINT_UNREACHABLE',
                },
            },
        });
    }
}

//是否需要延迟发送请求
function isNeedDelay(deviceId: string, iHostState: any) {
    logger.info('已发过的请求队列------------------------------------------------', controlRequestMapClass.requestMap.keys());

    const hasBeenRequest = controlRequestMapClass.requestMap.has(deviceId);

    if (!hasBeenRequest) {
        return false;
    }

    const power = _.get(iHostState, 'power');

    if (power) {
        return false;
    }

    const nowTime = Date.now();
    const timeStamp = controlRequestMapClass.requestMap.get(deviceId);
    const millisecond = dayjs(nowTime).diff(dayjs(timeStamp), 'millisecond');
    logger.info('间隔时间================================================================', millisecond);
    return millisecond < 200;
}
