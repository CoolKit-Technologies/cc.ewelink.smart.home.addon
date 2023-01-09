import { NextFunction, Request, Response } from 'express';
import { toResponse } from '../utils/error';
import syncDeviceToIHost from './public/syncDeviceToIHost';
import _ from 'lodash';
import logger from '../utils/logger';
import getIhostSyncDeviceList from './public/getIhostSyncDeviceList';
import db from '../utils/db';

/** 同步ewelink设备到ihost */
export default async function toSyncDeviceToIHost(req: Request, res: Response, next: NextFunction) {
    try {
        const { deviceId } = req.params;

        const resData = await syncDeviceToIHost([deviceId]);
        if (!resData) {
            logger.error('请求ihost失败-----------------------');
            return res.json(toResponse(500));
        }

        if (resData?.payload.description === 'headers.Authorization is invalid') {
            logger.error('没有ihost token --------------------------');
            //iHostToken 失效，清空
            db.setDbValue('iHostToken', '');
            return res.json(toResponse(1100));
        }

        if (resData?.payload.type === 'INVALID_PARAMETERS') {
            logger.error('请求同步ihost的参数有误------------------');
            //参数错误
            return res.json(toResponse(500));
        }

        await getIhostSyncDeviceList();

        res.json(toResponse(0));
    } catch (error: any) {
        logger.error('同步ihost设备报错-----------------------------', error);
        res.json(toResponse(500));
    }
}
