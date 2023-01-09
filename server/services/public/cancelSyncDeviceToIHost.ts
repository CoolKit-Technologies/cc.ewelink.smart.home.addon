import _ from 'lodash';
import { deleteDevice } from '../../api/iHost';
import deviceDataUtil from '../../utils/deviceDataUtil';
import logger from '../../utils/logger';

/** 取消同步ewelink设备到ihost */
export default async (deviceId: string) => {
    try {
        const iHostDeviceData = deviceDataUtil.getIHostDeviceDataByDeviceId(deviceId);
        if (!iHostDeviceData) {
            logger.error('取消同步设备到时候找不到这个设备-----------------', iHostDeviceData);
            return null;
        }
        const res = await deleteDevice(iHostDeviceData.serial_number);

        return res;
    } catch (error: any) {
        logger.error('取消同步设备报错---------------------', deviceId, error);
        return null;
    }
};
