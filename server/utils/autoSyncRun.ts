import db from './db';
import syncDeviceToIHost from '../services/public/syncDeviceToIHost';
import generateDeviceInfoList from './generateDeviceInfoList';
import deviceMapUtil from './deviceMapUtil';
import cancelSyncDeviceToIHost from '../services/public/cancelSyncDeviceToIHost';
import _ from 'lodash';
import logger from './logger';
import { decode } from 'js-base64';
import getIhostSyncDeviceList from '../services/public/getIhostSyncDeviceList';

/**
 * 自动同步
 *
 * @export
 * @param {number} interValTime 间隔时间（s）
 */
export default async function () {
    try {
        const eWeLinkDeviceList = db.getDbValue('eWeLinkDeviceList');
        const iHostDeviceList = db.getDbValue('iHostDeviceList');
        const autoSyncStatus = db.getDbValue('autoSyncStatus');

        if (!eWeLinkDeviceList || !iHostDeviceList || !autoSyncStatus) {
            logger.error('自动同步设备条件不满足--------------------', 'autoSyncStatus', autoSyncStatus);
            return;
        }

        const syncedHostDeviceList = iHostDeviceList.map((item) => {
            if (!item.tags.deviceInfo) return '';
            const deviceInfo = JSON.parse(decode(item.tags.deviceInfo));
            if (deviceInfo) {
                return deviceInfo.deviceId as string;
            }
            return '';
        });

        const mDnsDeviceList = deviceMapUtil.getMDnsDeviceList();

        const deviceList = generateDeviceInfoList(syncedHostDeviceList, mDnsDeviceList, eWeLinkDeviceList);
        //在我账户下，支持的uiid，未同步
        const noSyncDeviceList = deviceList.filter((item) => item.isMyAccount && item.isSupported && !item.isSynced).map((item) => item.deviceId);
        //自动同步满足条件可同步的设备
        if (noSyncDeviceList.length > 0) {
            const res = await syncDeviceToIHost(noSyncDeviceList);
            logger.info('自动同步设备的结果-----------------', res);
            getIhostSyncDeviceList();
        }

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
                cancelSyncDeviceToIHost(deviceInfo.deviceId);
            }
        });
    } catch (error: any) {
        logger.error('执行自动同步和自动取消同步时候报错----------------------', error);
    }
}
