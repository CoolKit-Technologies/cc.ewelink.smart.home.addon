import makeMdns from 'multicast-dns';
import type { IMdnsRes } from '../ts/interface/IMdns';
import mDnsDataParse from './mDnsDataParse';
import logger from './logger';
import _ from 'lodash';
import deviceMapUtil from './deviceMapUtil';
import syncDeviceStateToIHost from '../services/public/syncDeviceStateToIHost';

const mdns = makeMdns();

mdns.on('response', (response: any) => {
    const { answers } = response;
    // if (JSON.stringify(answers).indexOf('eWeLink_1000d07052.local') > -1) {
    //     logger.info(
    //         '收到响应------------------------3',
    //         answers.map((item: any) => item.type),
    //         answers
    //     );
    //     logger.info('-------');
    //     logger.info('-------');
    //     logger.info('-------');
    // }
    // if (JSON.stringify(answers).indexOf('eWeLink_1000bf3193.local') > -1) {
    //     logger.info(
    //         '收到响应------------------------8',
    //         answers.map((item: any) => item.type),
    //         answers
    //     );
    //     logger.info('-------');
    //     logger.info('-------');
    //     logger.info('-------');
    // }

    // if (JSON.stringify(answers).indexOf('eWeLink_100126d03d.local') > -1) {
    //     logger.info(
    //         '收到响应------------------------77',
    //         answers.map((item: any) => item.type),
    //         answers
    //     );
    //     logger.info('-------');
    //     logger.info('-------');
    //     logger.info('-------');
    // }

    if (!Array.isArray(answers)) return;
    if (answers.length === 0) return;
    let deviceId = '';
    const tmp = {} as IMdnsRes;
    for (const item of answers) {
        const data = item.data;
        switch (item.type) {
            case 'PTR':
                if (`${data}`.indexOf('ewelink') === -1) {
                    return;
                }
                tmp.ptr = data;
                break;
            case 'A':
                tmp.a = data;
                break;
            case 'SRV':
                tmp.srv = data;
                break;
            case 'TXT':
                const arr = data.toString().split(/(?<!\{.*),(?!\}.*)/);
                const txtData: any = {};
                arr.map((str: string) => {
                    const [key, value] = str.split('=');
                    try {
                        txtData[key] = JSON.parse(value);
                    } catch {
                        txtData[key] = value;
                    }
                });
                tmp.txt = txtData;
                deviceId = txtData.id;
                break;
            default:
                break;
        }
    }

    if (!deviceId) {
        return;
    }

    const params = parseParams(tmp);

    if (!params) {
        return;
    }

    //单通道 uiid 1
    // if (params && params.deviceId.toString() ==='100084c34c' ){
    //     const { iv, encryptedData } = params;
    //     logger.error('after parse--------------------100084c34c----1', mDnsDataParse.decryptionData({ iv, key: "9427891f-c6ad-465a-8b5e-e3615f17a0cf", data: encryptedData }));
    // }

    //三通道 uiid 8
    // if (params && params.deviceId ==='1000813180' ){
    //     const { iv, encryptedData } = params;
    //     logger.error('after parse--------------------100081318---80', mDnsDataParse.decryptionData({ iv, key: "2cf2c250-3848-4d75-9af4-88f3aacfff6f", data: encryptedData }));
    // }

    //四通道uiid 4
    // if (params && params.deviceId === '1000a67288') {
    //     const { iv, encryptedData } = params;
    //     logger.error('after parse--------------------1000a67288---4', mDnsDataParse.decryptionData({ iv, key: '38c45dbd-545d-4bf5-8752-be849c2260a1', data: encryptedData }));
    // }

    //单通道uiid 77
    // if (params && params.deviceId === '1000dc2268') {
    //     const { iv, encryptedData } = params;
    //     logger.error('after parse--------------------1000dc2268----77', mDnsDataParse.decryptionData({ iv, key: 'c4dffb08-cd15-4ba2-ba66-59fefc15d98e', data: encryptedData }));
    // }

    //如果设备（例如UIID 77）没有ip，有target，查询一次mDns的 A 类型
    if (params && !params.ip && params.target) {
        deviceMapUtil.mDnsQueryA(params.deviceId, params.target);
    }

    // 如果ip不存在说明该设备可能不支持局域网
    if (!params || (!params.ip && !params.target)) {
        // logger.error(`扫描到的设备不是局域网设备 --------------: ${params?.deviceId}`);
        return;
    }

    //维护局域网设备队列
    deviceMapUtil.setOnline(params);

    //同步局域网的设备状态到iHost里
    syncDeviceStateToIHost(params.deviceId);
});

//整理收到的数据
const parseParams = (device: IMdnsRes) => {
    const { txt, a, srv } = device;
    const data1 = _.get(txt, 'data1', '');
    const data2 = _.get(txt, 'data2', '');
    const data3 = _.get(txt, 'data3', '');
    const data4 = _.get(txt, 'data4', '');

    try {
        return {
            deviceId: txt.id.toString(),
            type: txt.type,
            encryptedData: `${data1}${data2}${data3}${data4}`,
            ip: a,
            port: srv.port,
            target: srv.target,
            iv: mDnsDataParse.decryptionBase64(txt.iv),
        };
    } catch (error) {
        return null;
    }
};

export default mdns;
