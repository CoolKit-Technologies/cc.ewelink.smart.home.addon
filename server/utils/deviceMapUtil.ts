import DeviceMapClass from '../ts/class/deviceMap';
import dayjs from 'dayjs';
import { IMdnsParseRes } from '../ts/interface/IMdns';
import syncDeviceOnlineToIHost from '../services/public/syncDeviceOnlineToIHost';
import config from '../config';
import logger from './logger';
import db from './db';
import _ from 'lodash';
import mdns from './initMdns';
import { decode } from 'js-base64';

const { mDnsGapTime, disappearTime } = config.timeConfig;

//更新已搜索到的设备列表
async function setOnline(params: IMdnsParseRes) {
    let saveParams: any = params;

    if (DeviceMapClass.deviceMap.has(params.deviceId)) {
        const oldDevice = DeviceMapClass.deviceMap.get(params.deviceId);
        saveParams = params;
        if (!params.ip) {
            saveParams.ip = oldDevice?.deviceData.ip;
        }
    }

    saveParams.isOnline = true;
    DeviceMapClass.deviceMap.set(params.deviceId, {
        discoveryTime: Date.now(),
        deviceData: saveParams,
    });
    syncDeviceOnlineToIHost(params.deviceId, true);
}

/** 设置离线状态 */
function setOffline() {
    //网关切换wifi的情况下，将已同步的设备但是不在局域网中的设备离线
    const iHostDeviceList = db.getDbValue('iHostDeviceList');

    if (iHostDeviceList) {
        let deviceIdList = iHostDeviceList.map((item) => {
            if (!item.tags.deviceInfo) return '';
            const deviceInfo = JSON.parse(decode(item.tags.deviceInfo));
            if (deviceInfo) {
                return deviceInfo.deviceId;
            }
            return '';
        });

        _.remove(deviceIdList, (item) => item === '');

        deviceIdList.forEach((item) => {
            if (!DeviceMapClass.deviceMap.has(item)) {
                setTimeout(() => {
                    syncDeviceOnlineToIHost(item, false);
                }, 50);
            }
        });
    }

    //正常流程判断
    const nowTime = Date.now();
    const deviceList = [...DeviceMapClass.deviceMap].map((item) => {
        return {
            deviceId: item[0],
            discoveryTime: item[1].discoveryTime,
            deviceData: item[1].deviceData,
        };
    });

    if (deviceList.length === 0) return;
    logger.info(
        '局域网设备列表----------------------',
        deviceList.map((t) => ({ deviceId: t.deviceId, second: dayjs(nowTime).diff(dayjs(t.discoveryTime), 'seconds'), ip: t.deviceData.ip }))
    );
    //遍历设备列表给状态
    for (const item of deviceList) {
        //设备发现时间和当前时间的间隔
        const seconds = dayjs(nowTime).diff(dayjs(item.discoveryTime), 'seconds');

        const eWeLinkDeviceList = db.getDbValue('eWeLinkDeviceList');

        const noLogin = !eWeLinkDeviceList || eWeLinkDeviceList.length === 0;

        //未登录，已同步的设备全部离线
        if (noLogin) {
            //设备消失
            if (seconds > mDnsGapTime) {
                DeviceMapClass.deviceMap.delete(item.deviceId);
            }
            syncDeviceOnlineToIHost(item.deviceId, false);
            continue;
        }

        //登录后
        //是否存在于易微联中
        const isExistEWeLinkDevice = eWeLinkDeviceList.some((eItem) => eItem.itemData.deviceid === item.deviceId);

        //不在易微联账号下且扫描不到设备就消失
        if (!isExistEWeLinkDevice) {
            if (seconds > mDnsGapTime) {
                DeviceMapClass.deviceMap.delete(item.deviceId);
            }
            continue;
        }

        //在易微联账号下且十分钟扫描不到设备就离线
        if (seconds > disappearTime) {
            item.deviceData.isOnline = false;
            DeviceMapClass.deviceMap.set(item.deviceId, {
                discoveryTime: item.discoveryTime,
                deviceData: item.deviceData,
            });
            setTimeout(() => {
                syncDeviceOnlineToIHost(item.deviceId, false);
            }, 50);
        }
    }
}

/** 设备没有ip的时候，发一次 A 类型 请求查询 */
function mDnsQueryA(deviceId: string, target: string) {
    //防止请求过于频繁，影响设备控制

    if (DeviceMapClass.deviceMap.has(deviceId)) {
        const device = DeviceMapClass.deviceMap.get(deviceId);

        if (device && device.deviceData.ip) {
            return;
        }

        mdns.query({
            questions: [
                {
                    name: target,
                    type: 'PTR',
                },
            ],
        });
    }
}

/** 获取已搜索到的局域网设备 */
function getMDnsDeviceList() {
    let arr: any = Array.from(DeviceMapClass.deviceMap.entries());
    arr = arr.map((item: any) => {
        return {
            deviceId: item[0],
            ...item[1],
        };
    });
    return arr as {
        deviceId: string;
        discoveryTime: number;
        deviceData: IMdnsParseRes;
    }[];
}

/** 根据设备id获取设备的局域网信息 */
function getMDnsDeviceDataByDeviceId(deviceId: string) {
    const mDnsDeviceList = getMDnsDeviceList();
    const thisItem = mDnsDeviceList.find((item) => {
        return item.deviceId === deviceId;
    });
    if (!thisItem) {
        logger.error('找不到这个设备的局域网信息-------------------------', deviceId);
        return null;
    }

    return thisItem;
}
export default {
    setOnline,
    setOffline,
    mDnsQueryA,
    getMDnsDeviceList,
    getMDnsDeviceDataByDeviceId,
};
