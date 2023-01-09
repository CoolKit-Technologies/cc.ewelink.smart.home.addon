import _ from 'lodash';
import { syncDeviceStateToIHost } from '../../api/iHost';
import { v4 as uuidv4 } from 'uuid';
import deviceMapUtil from '../../utils/deviceMapUtil';
import deviceDataUtil from '../../utils/deviceDataUtil';
import logger from '../../utils/logger';
import iHostDeviceMap from '../../ts/class/iHostDeviceMap';
import db from '../../utils/db';
/** 设备状态上报 */
export default async (deviceId: string) => {
    try {
        const mDnsDeviceData = deviceMapUtil.getMDnsDeviceDataByDeviceId(deviceId);
        if (!mDnsDeviceData) {
            return;
        }
        const { encryptedData } = mDnsDeviceData.deviceData;
        const newState = deviceDataUtil.lanStateToIHostState(deviceId, encryptedData);
        if (!newState) {
            return;
        }

        const iHostDeviceData = deviceDataUtil.getIHostDeviceDataByDeviceId(deviceId);

        if (!iHostDeviceData) {
            return;
        }
        const oldState = iHostDeviceMap.deviceMap.get(deviceId);

        let state = newState;

        //设备状态没有改变，不同步
        if (JSON.stringify(newState) === JSON.stringify(oldState)) {
            return;
        }

        const eWeLinkApiInfo = db.getDbValue('eWeLinkApiInfo');

        //未登录不同步状态
        if (!eWeLinkApiInfo) {
            return;
        }

        if (iHostDeviceData.deviceInfo.account !== eWeLinkApiInfo.userInfo.account) {
            return;
        }
        //修复uiid 77 设备，能力和数据不符情况
        if (!iHostDeviceData.capabilitiyList.includes('rssi')) {
            state = _.omit(state, ['rssi']);
        }
        const params = {
            event: {
                header: {
                    name: 'DeviceStatesChangeReport',
                    message_id: uuidv4(),
                    version: '1',
                },
                endpoint: {
                    serial_number: iHostDeviceData?.serial_number,
                    third_serial_number: deviceId,
                },
                payload: {
                    state,
                },
            },
        };
        //过滤同一个设备的多个相同状态，只上报一个请求
        iHostDeviceMap.deviceMap.set(deviceId, newState);

        const res = await syncDeviceStateToIHost(params);

        //确认这个请求是成功的
        if (res && res.header && res.header.name === 'Response') {
            iHostDeviceMap.deviceMap.set(deviceId, newState);
        }

        return res;
    } catch (error: any) {
        logger.error('同步设备状态的时候报错-------------------------', deviceId, error);
        return null;
    }
};
