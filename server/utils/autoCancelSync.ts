import db from './db';
import cancelSyncDeviceToIHost from '../services/public/cancelSyncDeviceToIHost';
import _ from 'lodash';
import logger from './logger';
import { decode } from 'js-base64';

/**
 * 设备被删除，自动取消同步
 */
export default async function () {
    try {
        const eWeLinkDeviceList = db.getDbValue('eWeLinkDeviceList');
        const iHostDeviceList = db.getDbValue('iHostDeviceList');

        //自动取消同步，条件：已同步的设备的被删除(已同步的iHost设备的account和当前的登录的account相同，易微联列表下没有该设备)
        const eWeLinkApiInfo = db.getDbValue('eWeLinkApiInfo');

        if (!eWeLinkApiInfo) {
            logger.error('没有登录-----------------不执行自动取消同步', eWeLinkApiInfo);
            return;
        }

        const eWeLinkDeviceIdList = eWeLinkDeviceList.map((item) => item.itemData.deviceid);
        const account = eWeLinkApiInfo.userInfo.account;

        iHostDeviceList.forEach((item) => {
            if (!item.tags.deviceInfo) return;
            const deviceInfo = JSON.parse(decode(item.tags.deviceInfo));
            //当前账号下不存在该设备（该设备已被删除）
            if (deviceInfo.account === account && !eWeLinkDeviceIdList.includes(deviceInfo.deviceId)) {
                logger.info('执行了自动取消同步--------------------------------------------------------', deviceInfo.deviceId);
                cancelSyncDeviceToIHost(deviceInfo.deviceId);
            }
        });
    } catch (error: any) {
        logger.error('执行自动同步和自动取消同步时候报错----------------------', error);
    }
}
