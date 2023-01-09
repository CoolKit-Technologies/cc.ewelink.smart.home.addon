import db from './db';
import IEWeLinkDevice from '../ts/interface/IEWeLinkDevice';
import deviceMapUtil from './deviceMapUtil';
import _ from 'lodash';
import mDnsDataParse from './mDnsDataParse';
import { ILanStateSingleSwitch, ILanStateMultipleSwitch } from '../ts/interface/ILanState';
import { IHostStateSingleSwitch, IHostStateMultipleSwitch } from '../ts/interface/IHostState';
import logger from './logger';
import { encode, decode } from 'js-base64';
import config from '../config';
/**
 * 映射到云端设备的UIID
 */
enum EUiid {
    /** 单通道插座 */
    plug_1 = 1,
    /** 双通道插座 */
    plug_2 = 2,
    /** 三通道插座 */
    plug_3 = 3,
    /** 四通道插座 */
    plug_4 = 4,
    /** 单通道开关 */
    switch_1 = 6,
    /** 双通道开关 */
    switch_2 = 7,
    /** 三通道开关 */
    switch_3 = 8,
    /** 四通道开关 */
    switch_4 = 9,
    /** 单通道插座-多通道版 */
    plug_1_multi = 77,
}

export const supportUiidList = [1, 2, 3, 4, 6, 7, 8, 9, 77];

/** 生成要同步的iHost端的设备数据 */
function generateSyncIHostDeviceData(deviceId: string) {
    const eWeLinkDeviceData = getEwelinkDeviceDataByDeviceId(deviceId);
    if (!eWeLinkDeviceData) {
        // logger.error('生成要同步的iHost端的设备数据的时候拿不到易微联设备数据-------------------');
        return null;
    }

    const eWeLinkApiInfo = db.getDbValue('eWeLinkApiInfo');
    if (!eWeLinkApiInfo) {
        // logger.error('🚀 ~ file:生成要同步的iHost端的设备数据的时候拿不到eWeLinkApiInfo数据，还没登录 deviceDataUtil.ts ~ line 46 ~ generateSyncIHostDeviceData ~ eWeLinkApiInfo', eWeLinkApiInfo);
        return null;
    }

    const { uiid, manufacturer, model } = eWeLinkDeviceData.itemData.extra;

    const service_address = `${config.localIp}/api/v1/device/${deviceId}`;

    const deviceInfo = encode(
        JSON.stringify({
            deviceId,
            devicekey: eWeLinkDeviceData.itemData.devicekey,
            selfApikey: eWeLinkDeviceData.itemData.apikey,
            account: eWeLinkApiInfo.userInfo.account,
            service_address,
        })
    );
    const mDnsDeviceData = deviceMapUtil.getMDnsDeviceDataByDeviceId(deviceId);

    let state: any = {};
    if (mDnsDeviceData) {
        state = lanStateToIHostState(deviceId, mDnsDeviceData.deviceData.encryptedData);
        // logger.error('🚀 ~ file:生成要同步的iHost端的设备数据的时候拿不到 mDnsDeviceData ，deviceDataUtil.ts ~ line 66 ~ generateSyncIHostDeviceData ~ state', state);
    }

    if (!state) {
        // logger.error('🚀 ~ file:生成要同步的iHost端的设备数据的时候拿不到 state， deviceDataUtil.ts ~ line 72 ~ generateSyncIHostDeviceData ~ state', state);
        return null;
    }

    const { display_category, capabilities } = getDisplayCategoryAndCapabilitiesByUiid(uiid, state);

    if (display_category === '' || capabilities.length === 0) {
        return null;
    }

    return {
        third_serial_number: deviceId,
        name: eWeLinkDeviceData.itemData.name,
        display_category,
        capabilities,
        state,
        manufacturer,
        model,
        tags: {
            deviceInfo,
        },
        firmware_version: '1',
        service_address,
    };
}

/** 根据uiid获取设备类别和能力 */
function getDisplayCategoryAndCapabilitiesByUiid(uiid: EUiid, state: any) {
    const thisItem = coolkitDeviceProfiles.find((item) => item.uiidList.includes(uiid));
    if (!thisItem) {
        return { display_category: '', capabilities: [] };
    }

    const capabilityList = thisItem.capabilities;

    const capabilities = capabilityList.map((ability) => {
        if (ability.indexOf('toggle') <= -1) {
            return {
                capability: ability,
                permission: 'readWrite',
            };
        }

        const toggleNum = ability.split('_')[1];
        return {
            capability: 'toggle',
            permission: 'readWrite',
            name: toggleNum.toString(),
        };
    });

    if (_.get(state, 'rssi')) {
        capabilities.push({
            capability: 'rssi',
            permission: 'read',
        });
    }

    return {
        display_category: thisItem.category,
        capabilities,
    };
}

const coolkitDeviceProfiles = [
    //开关插座类
    { uiidList: [EUiid.plug_1, EUiid.switch_1, EUiid.plug_1_multi], category: 'switch', capabilities: ['power'] },
    { uiidList: [EUiid.plug_2, EUiid.switch_2], category: 'switch', capabilities: ['power', 'toggle_1', 'toggle_2'] },
    { uiidList: [EUiid.plug_3, EUiid.switch_3], category: 'switch', capabilities: ['power', 'toggle_1', 'toggle_2', 'toggle_3'] },
    { uiidList: [EUiid.switch_3], category: 'switch', capabilities: ['power', 'toggle_1', 'toggle_2', 'toggle_3'] }, //uiid8没有信号能力
    { uiidList: [EUiid.plug_4, EUiid.switch_4], category: 'switch', capabilities: ['power', 'toggle_1', 'toggle_2', 'toggle_3', 'toggle_4'] },
];

/** 根据设备id得到ewelink里的设备数据 */
function getEwelinkDeviceDataByDeviceId(deviceId: string) {
    const eWeLinkDeviceList = db.getDbValue('eWeLinkDeviceList') as IEWeLinkDevice[];
    if (!eWeLinkDeviceList) {
        // logger.error('🚀 ~ file:根据设备id得到ewelink里的设备数据的时候拿不到 eWeLinkDeviceList，deviceDataUtil.ts ~ line 100 ~ getEwelinkDeviceDataByDeviceId ~ eWeLinkDeviceList', eWeLinkDeviceList);
        return null;
    }

    const eWeLinkDeviceData = eWeLinkDeviceList.find((item) => item.itemData.deviceid === deviceId);
    if (!eWeLinkDeviceData) {
        // logger.error('🚀 ~ file:根据设备id得到ewelink里的设备数据的时候拿不到 eWeLinkDeviceData , deviceDataUtil.ts ~ line 102 ~ getEwelinkDeviceDataByDeviceId ~ eWeLinkDeviceData', eWeLinkDeviceData);
        return null;
    }
    return eWeLinkDeviceData;
}

/** 生成控制局域网设备的必要参数 */
export function generateUpdateLanDeviceParams(deviceId: string) {
    const mDnsDeviceData = deviceMapUtil.getMDnsDeviceDataByDeviceId(deviceId)?.deviceData;

    if (!mDnsDeviceData) {
        logger.info('找不到局域网设备------------------', deviceId);
        // logger.error('🚀 ~ file: deviceDataUtil.ts ~ line 109 ~ generateUpdateLanDeviceParams ~ mDnsDeviceData', mDnsDeviceData);
        return null;
    }

    return {
        ip: mDnsDeviceData.ip ?? mDnsDeviceData.target,
        port: mDnsDeviceData.port,
        deviceid: mDnsDeviceData.deviceId.toString(),
    };
}

//根据设备id获取iHost设备数据
function getIHostDeviceDataByDeviceId(deviceId: string) {
    const iHostDeviceList = db.getDbValue('iHostDeviceList');
    if (!iHostDeviceList) {
        // logger.error('🚀 ~ file:根据设备id获取iHost设备数据的时候拿不到 iHostDeviceList， deviceDataUtil.ts ~ line 160 ~ getIHostDeviceDataByDeviceId ~ iHostDeviceList', iHostDeviceList);
        return null;
    }

    const iHostDeviceData = iHostDeviceList.find((item) => {
        if (!item.tags.deviceInfo) return false;
        const deviceInfo = JSON.parse(decode(item.tags.deviceInfo));
        if (deviceInfo) {
            return deviceInfo.deviceId === deviceId;
        }
        return false;
    });
    if (!iHostDeviceData) {
        // logger.error('🚀 ~ file:根据设备id获取iHost设备数据拿不到 iHostDeviceData, deviceDataUtil.ts ~ line 139 ~ getIHostDeviceDataByDeviceId ~ thisItem', JSON.stringify(iHostDeviceList));
        return null;
    }

    const deviceInfo = JSON.parse(decode(iHostDeviceData.tags.deviceInfo));
    return {
        serial_number: iHostDeviceData.serial_number,
        deviceId: deviceInfo.deviceId,
        devicekey: deviceInfo.devicekey,
        selfApikey: deviceInfo.selfApikey,
        deviceInfo,
        isOnline: iHostDeviceData.online,
        capabilitiyList: iHostDeviceData.capabilities.map((item) => item.capability),
    };
}
//同步设备到iHost用到，devicekey从eWeLink里拿
//同步设备状态到iHost用到，devicekey从iHost里拿
/** 将局域网的设备状态数据格式转换为iHost的state数据格式 */
function lanStateToIHostState(deviceId: string, encryptedData: string) {
    const mDnsParams = deviceMapUtil.getMDnsDeviceDataByDeviceId(deviceId);

    if (!mDnsParams) {
        // logger.error('🚀 ~ file: deviceDataUtil.ts ~ line 166 ~ lanStateToIHostState ~ mDnsParams', mDnsParams);
        return null;
    }
    const iHostDeviceData = getIHostDeviceDataByDeviceId(deviceId);
    if (!iHostDeviceData) {
        // logger.error('🚀 ~ file: deviceDataUtil.ts ~ line 172 ~ lanStateToIHostState ~ iHostDeviceData', iHostDeviceData);
    }

    const eWeLinkDeviceData = getEwelinkDeviceDataByDeviceId(deviceId);

    if (!eWeLinkDeviceData) {
        // logger.error('🚀 ~ file: deviceDataUtil.ts ~ line 204 ~ lanStateToIHostState ~ eWeLinkDeviceData', eWeLinkDeviceData);
    }

    if (!iHostDeviceData && !eWeLinkDeviceData) {
        return null;
    }

    const state = mDnsDataParse.decryptionData({
        iv: mDnsParams.deviceData.iv,
        key: eWeLinkDeviceData ? eWeLinkDeviceData.itemData.devicekey : iHostDeviceData!.devicekey, //同步设备的时候，devicekey从云端里取，更新设备状态时才从ihost取
        data: encryptedData,
    });

    const uiid = getUiidByDeviceId(deviceId);
    if (!uiid) {
        // logger.error('🚀 ~ file: deviceDataUtil.ts ~ line 180 ~ lanStateToIHostState ~ uiid', uiid);
        return null;
    }
    let lanState;
    let iHostState: any = {};

    if ([EUiid.plug_1, EUiid.switch_1].includes(uiid)) {
        //单通道协议
        lanState = state as ILanStateSingleSwitch;
        // logger.error('🚀 ~ file: deviceDataUtil.ts ~ line 197 ~ lanStateToIHostState ~ lanState', lanState);
        const powerState = _.get(lanState, 'switch');
        iHostState = {
            power: {
                powerState: powerState,
            },
        };
    } else if ([EUiid.plug_1_multi].includes(uiid)) {
        //单通道用多通道协议
        lanState = state as ILanStateMultipleSwitch;
        const switches = _.get(lanState, 'switches');

        iHostState = {
            power: {
                powerState: switches[0].switch,
            },
        };
    } else {
        //多通道协议
        lanState = state as ILanStateMultipleSwitch;
        // logger.error('🚀 ~ file: deviceDataUtil.ts ~ line 215 ~ lanStateToIHostState ~ lanState', lanState);
        const switches = _.get(lanState, 'switches');
        let toggle: any = {};

        const toggleLength = getToggleLenByUiid(uiid);

        switches &&
            switches.forEach((item, index) => {
                //去除掉多余的通道
                if (index < toggleLength) {
                    toggle[item.outlet + 1] = {
                        toggleState: item.switch,
                    };
                }
            });

        iHostState = {
            toggle,
        };
    }
    const rssi = _.get(lanState, 'rssi');
    if (rssi) {
        iHostState = _.assign(iHostState, {
            rssi: {
                rssi,
            },
        });
    }

    return iHostState;
}

/** 根据uiid得到设备有几个通道 */
function getToggleLenByUiid(uiid: number) {
    //取得该uiid有几个通道
    const thisItem = coolkitDeviceProfiles.find((item) => item.uiidList.includes(uiid));
    if (!thisItem) {
        return 1;
    }
    const toggleLength = thisItem.capabilities.filter((item) => item.indexOf('toggle_') > -1).length;
    return toggleLength;
}

/** 将iHost的设备状态state转换成局域网设备的state
 * 单通道协议，单通道使用多通道协议，多通道协议
 */
function iHostStateToLanState(deviceId: string, state: any) {
    const uiid = getUiidByDeviceId(deviceId);
    if (!uiid) {
        // logger.error('🚀 ~ file: deviceDataUtil.ts ~ line 231 ~ iHostStateToLanState ~ uiid', uiid);
        return null;
    }

    let iHostState;
    if ([EUiid.plug_1, EUiid.switch_1].includes(uiid)) {
        iHostState = state as IHostStateSingleSwitch;
        const power = _.get(state, 'power', null);
        return JSON.stringify({ switch: power.powerState });
    } else if ([EUiid.plug_1_multi].includes(uiid)) {
        iHostState = state as IHostStateMultipleSwitch;
        const power = _.get(state, 'power', null);
        if (power) {
            let switches: any = [];

            Array(4)
                .fill(null)
                .forEach((item, index) => {
                    switches.push({
                        switch: power.powerState,
                        outlet: index,
                    });
                });

            return JSON.stringify({ switches });
        }
    } else {
        iHostState = state as IHostStateMultipleSwitch;
        const power = _.get(state, 'power', null);
        if (power) {
            let switches: any = [];
            Array(4)
                .fill(null)
                .forEach((item, index) => {
                    switches.push({
                        switch: power.powerState,
                        outlet: index,
                    });
                });

            return JSON.stringify({ switches });
        } else {
            const toggleObj = _.get(iHostState, 'toggle');
            if (!toggleObj) {
                return null;
            }

            let switches: any = [];
            for (const toggleIndex in toggleObj) {
                switches.push({
                    switch: toggleObj[toggleIndex].toggleState,
                    outlet: Number(toggleIndex) - 1,
                });
            }
            return JSON.stringify({ switches });
        }
    }
}

/** 根据deviceId得到ewelink设备的uiid */
function getUiidByDeviceId(deviceId: string) {
    const ewelinkDeviceData = getEwelinkDeviceDataByDeviceId(deviceId);
    if (!ewelinkDeviceData) {
        return null;
    }
    return ewelinkDeviceData.itemData.extra.uiid as number;
}

export default {
    generateSyncIHostDeviceData,
    generateUpdateLanDeviceParams,
    iHostStateToLanState,
    getIHostDeviceDataByDeviceId,
    lanStateToIHostState,
    getToggleLenByUiid,
    getUiidByDeviceId,
};
