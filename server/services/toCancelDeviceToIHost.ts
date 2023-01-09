import { NextFunction, Request, Response } from 'express';
import { toResponse } from '../utils/error';
import cancelSyncDeviceToIHost from './public/cancelSyncDeviceToIHost';
import _ from 'lodash';
import logger from '../utils/logger';
import getIhostSyncDeviceList from './public/getIhostSyncDeviceList';

/** 取消同步ewelink设备到ihost */
export default async function toCancelDeviceToIHost(req: Request, res: Response, next: NextFunction) {
    try {
        const { deviceId } = req.params;

        const resData = await cancelSyncDeviceToIHost(deviceId);
        logger.info('取消同步ihost设备到结果----------------------', resData);
        if (!resData) {
            throw new Error();
        }
        const { error, message, data } = resData;
        await getIhostSyncDeviceList();
        res.json(toResponse(error, message, data));
    } catch (error: any) {
        logger.error(`取消同步ihost设备代码执行过程中报错------------------ ${error.message}`);
        res.json(toResponse(500));
    }
}
