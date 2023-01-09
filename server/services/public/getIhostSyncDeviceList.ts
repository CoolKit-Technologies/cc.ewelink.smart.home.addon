import _ from 'lodash';
import { decode } from 'js-base64';
import { getIHostSyncDeviceList } from '../../api/iHost';
import db from '../../utils/db';
import logger from '../../utils/logger';

/** 获取iHost的eWeLink设备 */
export default async () => {
    try {
        const res = await getIHostSyncDeviceList();

        if (res.error !== 0 || !res.data) {
            logger.error('获取ihost所有设备到结果------------------------------', res);
            if ([400, 401].includes(res.error)) {
                //iHostToken 失效，清空
                db.setDbValue('iHostToken', '');
            }
            return [];
        }

        //过滤掉iHost设备，只保留已同步的设备
        const iHostDeviceList = res.data.device_list.filter((item) => !item.protocol);

        db.setDbValue('iHostDeviceList', iHostDeviceList);
        const deviceIdList = iHostDeviceList.map((item) => {
            if (!item.tags.deviceInfo) return '';
            const deviceInfo = JSON.parse(decode(item.tags.deviceInfo));
            if (deviceInfo) {
                return deviceInfo.deviceId;
            }
            return '';
        });
        return iHostDeviceList;
    } catch (error: any) {
        logger.error('获取ihost设备接口代码执行报错-----------------------------------------', error);
        return [];
    }
};
