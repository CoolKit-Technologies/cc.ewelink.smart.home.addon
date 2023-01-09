import fs from 'fs';
import _ from 'lodash';
import config from '../config';
import { encode, decode } from 'js-base64';
import IEWeLinkDevice from '../ts/interface/IEWeLinkDevice';
import IHostDevice from '../ts/interface/IHostDevice';

type DbKey = keyof IDbData;

interface IEWeLinkApiInfo {
    at: string;
    rt: string;
    region: string;
    userInfo: {
        account: string;
        autoSyncStatus: boolean;
    };
}
interface IDbData {
    /** api v2 at相关信息 */
    eWeLinkApiInfo: null | IEWeLinkApiInfo;
    /** at更新时间 */
    atUpdateTime: number;
    /** 易微联设备列表 */
    eWeLinkDeviceList: IEWeLinkDevice[];
    /** iHost网关凭证  */
    iHostToken: string;
    /** iHost设备列表 */
    iHostDeviceList: IHostDevice[];
    /** 自动同步 */
    autoSyncStatus: boolean;
}

export const dbDataTmp: IDbData = {
    eWeLinkApiInfo: null,
    atUpdateTime: 0,
    eWeLinkDeviceList: [],
    iHostToken: '',
    iHostDeviceList: [],
    autoSyncStatus: false,
};

/** 获取数据库文件所在路径 */
function getDbPath() {
    return config.nodeApp.dbPath;
}

/** 获取所有数据 */
function getDb() {
    const data = fs.readFileSync(getDbPath(), 'utf-8');
    return JSON.parse(decode(data)) as IDbData;
}

/** 清除所有数据 */
function clearStore() {
    fs.writeFileSync(getDbPath(), encode('{}'), 'utf-8');
}

/** 设置指定的数据库数据 */
function setDbValue(key: 'eWeLinkApiInfo', v: IDbData['eWeLinkApiInfo']): void;
function setDbValue(key: 'atUpdateTime', v: IDbData['atUpdateTime']): void;
function setDbValue(key: 'eWeLinkDeviceList', v: IDbData['eWeLinkDeviceList']): void;
function setDbValue(key: 'iHostToken', v: IDbData['iHostToken']): void;
function setDbValue(key: 'iHostDeviceList', v: IDbData['iHostDeviceList']): void;
function setDbValue(key: 'autoSyncStatus', v: IDbData['autoSyncStatus']): void;
function setDbValue(key: DbKey, v: IDbData[DbKey]) {
    const data = getDb();
    _.set(data, key, v);
    fs.writeFileSync(getDbPath(), encode(JSON.stringify(data)), 'utf-8');
}

/** 获取指定的数据库数据 */
function getDbValue(key: 'eWeLinkApiInfo'): IDbData['eWeLinkApiInfo'];
function getDbValue(key: 'atUpdateTime'): IDbData['atUpdateTime'];
function getDbValue(key: 'eWeLinkDeviceList'): IDbData['eWeLinkDeviceList'];
function getDbValue(key: 'iHostDeviceList'): IDbData['iHostDeviceList'];
function getDbValue(key: 'iHostToken'): IDbData['iHostToken'];
function getDbValue(key: 'autoSyncStatus'): IDbData['autoSyncStatus'];
function getDbValue(key: DbKey) {
    const data = getDb();
    return data[key];
}

export default {
    getDb,
    clearStore,
    setDbValue,
    getDbValue,
};
