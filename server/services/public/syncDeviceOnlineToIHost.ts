import _ from 'lodash';
import { syncDeviceOnlineToIHost } from '../../api/iHost';
import { v4 as uuidv4 } from 'uuid';
import logger from '../../utils/logger';
import deviceDataUtil from '../../utils/deviceDataUtil';
import db from '../../utils/db';

/** 设备上下线状态上报 */
export default async (deviceId: string, isOnline: boolean, isLogout = false) => {
    try {
        const iHostDeviceData = deviceDataUtil.getIHostDeviceDataByDeviceId(deviceId);

        //这个设备未同步
        if (!iHostDeviceData) {
            return;
        }
        //在线状态相同不更新状态
        if (iHostDeviceData.isOnline === isOnline) {
            return;
        }

        //退出登录，直接离线设备，不做帐号判断
        if (!isLogout) {
            const eWeLinkApiInfo = db.getDbValue('eWeLinkApiInfo');

            //未登录不同步状态
            if (!eWeLinkApiInfo) {
                return;
            }

            if (iHostDeviceData.deviceInfo.account !== eWeLinkApiInfo.userInfo.account) {
                logger.info('不在登录的帐号下，不同步在线离线-----------------', deviceId);
                return;
            }
        }

        const params = {
            event: {
                header: {
                    name: 'DeviceOnlineChangeReport',
                    message_id: uuidv4(),
                    version: '1',
                },
                endpoint: {
                    serial_number: iHostDeviceData.serial_number,
                    third_serial_number: deviceId,
                },
                payload: {
                    online: isOnline,
                },
            },
        };

        logger.info('同步设备上下线--------------------------------------------------------', deviceId, isOnline);
        const res = await syncDeviceOnlineToIHost(params);
        return res;
    } catch (error: any) {
        logger.error('同步上下线设备到时候报错------------------------------', error);
        return null;
    }
};
