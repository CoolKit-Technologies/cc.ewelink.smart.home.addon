import { NextFunction, Request, Response } from 'express';
import deviceMapUtil from '../utils/deviceMapUtil';
import { toResponse } from '../utils/error';
import logger from '../utils/logger';

/** 搜索局域网设备接口（登录前） */
export default async function getLanDeviceList(req: Request, res: Response, next: NextFunction) {
    try {
        //已搜索到的设备
        const mDnsDeviceList = deviceMapUtil.getMDnsDeviceList();
        if (!mDnsDeviceList) {
            logger.error('搜索局域网设备接口（登录前）------------拿不到局域网设备---------------', mDnsDeviceList);
            throw new Error();
        }

        const deviceList = mDnsDeviceList.map((item) => {
            return {
                deviceId: item.deviceId,
                category: item.deviceData.type,
            };
        });

        res.json(toResponse(0, 'success', { deviceList }));
    } catch (error: any) {
        logger.error('搜索局域网设备接口（登录前）代码执行过程中报错----------------------', error);
        res.json(toResponse(500, JSON.stringify(error)));
    }
}
