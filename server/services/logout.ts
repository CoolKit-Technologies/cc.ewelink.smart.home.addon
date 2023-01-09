import { NextFunction, Request, Response } from 'express';
import syncDeviceOnlineToIHost from '../services/public/syncDeviceOnlineToIHost';
import db from '../utils/db';
import { toResponse } from '../utils/error';
import logger from '../utils/logger';
import { decode } from 'js-base64';
import _ from 'lodash';

export default async function logout(req: Request, res: Response, next: NextFunction) {
    try {
        //退出登录后，离线该帐号下的所有已同步设备
        const iHostDeviceList = db.getDbValue('iHostDeviceList');

        const eWeLinkApiInfo = db.getDbValue('eWeLinkApiInfo');

        const account = eWeLinkApiInfo?.userInfo.account;

        if (iHostDeviceList && iHostDeviceList.length > 0) {
            iHostDeviceList.forEach((item) => {
                if (!item.tags.deviceInfo) return '';
                const deviceInfo = JSON.parse(decode(item.tags.deviceInfo));

                if (account === deviceInfo.account) {
                    setTimeout(() => {
                        logger.info('退出登录后的离线设备-----------------------', deviceInfo.deviceId);
                        syncDeviceOnlineToIHost(deviceInfo.deviceId, false, true);
                    }, 50);
                }
            });
        }

        //清空数据
        db.setDbValue('eWeLinkApiInfo', null);
        db.setDbValue('autoSyncStatus', false);
        db.setDbValue('atUpdateTime', 0);
        db.setDbValue('eWeLinkDeviceList', []);

        res.json(toResponse(0));
    } catch (error: any) {
        logger.error(`退出登录执行代码过程中报错--------------------- ${error.message}`);
        res.json(toResponse(500));
    }
}
