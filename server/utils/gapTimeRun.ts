import getIHostSyncDeviceList from '../services/public/getIhostSyncDeviceList';
import getEwelinkAllDeviceList from '../services/public/getEwelinkAllDeviceList';
import mdns from './initMdns';
import autoSyncRun from './autoSyncRun';
import config from '../config';
import db from './db';
import deviceMapUtil from './deviceMapUtil';
import autoCancelSync from './autoCancelSync';

const { mDnsGapTime, eweLinkGapTime, iHostGapTime, autoSyncGapTime, autoCancelSyncGapTime } = config.timeConfig;
/** mDns发起询问 */
function queryMdns() {
    mdns.query({
        questions: [
            {
                name: '_ewelink._tcp.local',
                type: 'PTR',
            },
        ],
    });
    deviceMapUtil.setOffline();
}

/** 是否能运行获取易微联接口，是否能运行获取iHost后端接口，是否能运行自动同步和自动取消同步 */
function canRun() {
    const eWeLinkApiInfo = db.getDbValue('eWeLinkApiInfo');
    const iHostToken = db.getDbValue('iHostToken');
    return {
        canRunGetEWeLink: !!eWeLinkApiInfo, //已登录
        canRunGetIHost: !!(eWeLinkApiInfo && iHostToken), //已登录且有网关凭证
        canRunAutoSync: !!(eWeLinkApiInfo && iHostToken), //已登录且有网关凭证
        canRunAutoCancelSync: !!(eWeLinkApiInfo && iHostToken), //已登录且有网关凭证
    };
}

/** 每隔一段时间拉取一次数据 */
export default function gapTimeRun() {
    queryMdns();
    getIHostSyncDeviceList();
    getEwelinkAllDeviceList();

    /** 一直请求局域网 */
    setInterval(() => {
        queryMdns();
    }, mDnsGapTime * 1000);

    /** 登录后而且有网关凭证之后调用iHost接口 */
    setInterval(() => {
        const { canRunGetIHost } = canRun();
        if (canRunGetIHost) {
            getIHostSyncDeviceList();
        }
    }, eweLinkGapTime * 1000);

    /** 登录后调用易微联接口 */
    setInterval(() => {
        const { canRunGetEWeLink } = canRun();
        if (canRunGetEWeLink) {
            getEwelinkAllDeviceList();
        }
    }, iHostGapTime * 1000);

    /** 登录后且有网关凭证跑自动运行同步，运行自动取消同步 */
    setInterval(() => {
        const { canRunAutoSync } = canRun();
        if (canRunAutoSync) {
            autoSyncRun();
        }
    }, autoSyncGapTime * 1000);

    /** 登录后且有网关凭证跑自动取消同步 */
    setInterval(() => {
        const { canRunAutoCancelSync } = canRun();
        if (canRunAutoCancelSync) {
            autoCancelSync();
        }
    }, autoCancelSyncGapTime * 1000);
}
