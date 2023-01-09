import { NextFunction, Request, Response } from 'express';
import deviceMapUtil from '../utils/deviceMapUtil';
import { toResponse } from '../utils/error';
import _ from 'lodash';
import logger from '../utils/logger';
import generateDeviceInfoList from '../utils/generateDeviceInfoList';
import db from '../utils/db';
import { decode } from 'js-base64';
import getIhostSyncDeviceList from './public/getIhostSyncDeviceList';

/** 搜索局域网设备接口（登录后） */
export default async function getLanDeviceInfoList(req: Request, res: Response, next: NextFunction) {
    try {
        //1、查询mdns设备
        let mDnsDeviceList = deviceMapUtil.getMDnsDeviceList();

        if (mDnsDeviceList.length === 0) {
            logger.error('搜索局域网设备接口（登录后）------------没有扫描到局域网设备-----------------------', mDnsDeviceList);
            return res.json(toResponse(0, 'not lan device', { deviceList: [] }));
        }

        //2、查询eWeLink设备列表
        const eWeLinkDeviceList = db.getDbValue('eWeLinkDeviceList');

        if (!eWeLinkDeviceList) {
            logger.error('搜索局域网设备接口（登录后）-------------没有拿到易微联帐号下的设备--------------------------', eWeLinkDeviceList);
            throw new Error();
        }

        //3、查询下iHost已同步设备列表
        const iHostDeviceList = await getIhostSyncDeviceList();

        let syncedHostDeviceList = iHostDeviceList.map((item) => {
            if (!item.tags.deviceInfo) return '';
            const deviceInfo = JSON.parse(decode(item.tags.deviceInfo));
            if (deviceInfo) {
                return deviceInfo.deviceId;
            }
            return '';
        });
        //只留下同步的设备
        syncedHostDeviceList = syncedHostDeviceList.filter((item) => item !== '');

        logger.info('当前已同步的到ihost到设备--------------------------------------', syncedHostDeviceList);

        const deviceList = generateDeviceInfoList(syncedHostDeviceList, mDnsDeviceList, eWeLinkDeviceList);

        return res.json(toResponse(0, 'success', { deviceList }));
    } catch (error: any) {
        logger.error(`获取局域网设备（登录后）代码执行过程报错---------------- ${error.message}`);
        res.json(toResponse(500));
    }
}
