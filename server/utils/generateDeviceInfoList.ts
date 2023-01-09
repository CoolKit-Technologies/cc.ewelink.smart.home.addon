import ELanType from '../ts/enum/ELanType';
import IDeviceMap from '../ts/interface/IDeviceMap';
import IEWeLinkDevice from '../ts/interface/IEWeLinkDevice';
import { supportUiidList } from '../utils/deviceDataUtil';
import logger from './logger';
import _ from 'lodash';

interface DeviceInfo {
    isOnline: boolean;
    isMyAccount: boolean;
    isSupported: boolean;
    displayCategory: string;
    familyName: string;
    deviceId: string;
    deviceName: string;
    isSynced: boolean;
}

/** uiid对应的图标类型 */
const UIID_TYPE_LIST = [
    {
        type: 'switch', //开关插座
        uiidList: [1, 2, 3, 4, 6, 7, 8, 9, 14, 15, 32, 77, 78, 126, 128, 133, 135, 138, 139, 140, 141, 160, 161, 162, 163, 165, 165, 191, 209, 210, 211, 212],
    },
    {
        type: 'button', //无线开关
        uiidList: [28],
    },
    {
        type: 'fanLight', //风扇灯
        uiidList: [34],
    },
    {
        type: 'light', //灯
        uiidList: [44, 103, 104, 136, 157],
    },
];

/** 生成设备信息，是否已同步，在线离线，是否支持 */
export default function (syncedHostDeviceList: string[], mDnsDeviceList: IDeviceMap[], eWeLinkDeviceList: IEWeLinkDevice[]) {
    const deviceList: DeviceInfo[] = [];

    mDnsDeviceList.forEach((mItem) => {
        const ewelinkDeviceData = eWeLinkDeviceList.find((eItem) => mItem.deviceId === eItem.itemData.deviceid);
        //默认不在账号下
        const device = {
            isOnline: true,
            isMyAccount: false,
            isSupported: false,
            displayCategory: '',
            familyName: '',
            deviceId: mItem.deviceId,
            deviceName: '',
            isSynced: false,
        };
        //在账号下
        if (ewelinkDeviceData) {
            device.isOnline = !!mItem.deviceData.isOnline;
            device.isMyAccount = true;

            device.displayCategory = getDeviceTypeByUiid(ewelinkDeviceData);
            device.isSupported = judgeIsSupported(ewelinkDeviceData);
            device.familyName = ewelinkDeviceData.familyName;
            device.deviceId = mItem.deviceId;
            device.deviceName = ewelinkDeviceData.itemData.name;
            device.isSynced = syncedHostDeviceList.includes(mItem.deviceId);
        }

        deviceList.push(device);
    });

    return deviceList;
}
/** 根据设备uiid返回设备的类型图标 */
function getDeviceTypeByUiid(ewelinkDeviceData: IEWeLinkDevice) {
    const { uiid } = ewelinkDeviceData.itemData.extra;

    const thisItem = UIID_TYPE_LIST.find((item) => item.uiidList.includes(uiid));
    if (thisItem) {
        return thisItem.type;
    }
    return 'switch';
}

/** 判断固件版本是否支持局域网功能 */
function judgeIsSupported(ewelinkDeviceData: IEWeLinkDevice) {
    const { uiid } = ewelinkDeviceData.itemData.extra;

    if (!supportUiidList.includes(uiid)) {
        return false;
    }
    //不支持的功能
    const denyFeatures = _.get(ewelinkDeviceData, ['itemData', 'denyFeatures'], []);

    //如果不支持局域网功能
    if (denyFeatures.includes('localCtl')) {
        return false;
    }

    return true;
}
