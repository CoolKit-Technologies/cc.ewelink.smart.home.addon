import axios from 'axios';
import mDnsDataParse from '../../utils/mDnsDataParse';
import deviceDataUtil from '../../utils/deviceDataUtil';
import logger from '../../utils/logger';

/** 控制单通道协议 */
const setSwitch = async (deviceId: string, devicekey: string, selfApikey: string, state: any) => {
    try {
        const params = deviceDataUtil.generateUpdateLanDeviceParams(deviceId);

        if (!params || !state) {
            logger.error('控制设备报错---------------', params, state);
            return null;
        }

        const { ip, port, deviceid } = params;

        const iv = `abcdef${Date.now()}abcdef`.slice(0, 16);

        const reqData = {
            iv: mDnsDataParse.encryptionBase64(iv),
            deviceid,
            selfApikey,
            encrypt: true,
            sequence: `${Date.now()}`,
            data: mDnsDataParse.encryptionData({
                iv,
                data: state,
                key: devicekey,
            }),
        };

        const res = await axios.post(`http://${ip}:${port}/zeroconf/switch`, reqData);
        return res.data as {
            error: number;
        };
    } catch (error: any) {
        logger.error('控制局域网单通道设备报错----------------------------', deviceId, error);
        return null;
    }
};

/** 控制多通道协议 */
const setSwitches = async (deviceId: string, devicekey: string, selfApikey: string, state: any) => {
    try {
        const params = deviceDataUtil.generateUpdateLanDeviceParams(deviceId);

        if (!params || !state) {
            logger.error('控制设备报错---------------', params, state);
            return;
        }
        logger.info('下发给局域网设备的state------------------', deviceId, state);

        const { ip, port, deviceid } = params;
        const iv = `abcdef${Date.now()}abcdef`.slice(0, 16);
        const reqData = {
            iv: mDnsDataParse.encryptionBase64(iv),
            deviceid,
            selfApikey,
            encrypt: true,
            sequence: `${Date.now()}`,
            data: mDnsDataParse.encryptionData({
                iv,
                data: state,
                key: devicekey,
            }),
        };

        const res = await axios.post(`http://${ip}:${port}/zeroconf/switches`, reqData);
        logger.info('控制局域网设备的返回结果--------------------------', deviceId, res.status);
        return res.data as {
            error: number;
        };
    } catch (error) {
        logger.error('控制局域网多通道设备报错----------------------------', deviceId, error);
        return null;
    }
};

export default {
    setSwitch,
    setSwitches,
};
