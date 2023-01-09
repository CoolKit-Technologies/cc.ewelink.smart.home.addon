import CkApi from './../../lib/coolkit-api';
import _ from 'lodash';
import IEWeLinkDevice from '../../ts/interface/IEWeLinkDevice';
import db from '../../utils/db';
import logger from '../../utils/logger';

export default async () => {
    try {
        //1、获取家庭列表，得到家庭id和家庭名字
        const res = await CkApi.family.getFamilyList({});

        if (res.error !== 0) {
            logger.info('🚀 ~ file:请求得到家庭数据 -----------------------------', res);
            if (res.error === 401) {
                db.setDbValue('eWeLinkApiInfo', null);
            }
            return null;
        }

        const originFamilyList = res.data.familyList.filter((item) => [1, 2].includes(item.familyType)); //自己的设备和别人分享的设备
        const familyList = originFamilyList.map((item) => {
            return {
                familyId: item.id,
                familyName: item.name,
            };
        });

        const familyObj: { [key: string]: string } = {};
        familyList.forEach((item) => {
            familyObj[item.familyId] = item.familyName;
        });

        //2、获取设备数据列表
        const toGetDeviceList = [];
        for (const family of familyList) {
            toGetDeviceList.push(CkApi.device.getThingList({ familyid: family.familyId, num: 0 }));
        }

        const originDeviceResList = await Promise.all(toGetDeviceList);

        if (originDeviceResList.some((item) => item.error !== 0)) {
            logger.error('获取家庭下的设备报错--------------', originDeviceResList);
            return null;
        }
        const deviceList: IEWeLinkDevice[] = [];

        for (const res of originDeviceResList) {
            const { thingList } = res.data;
            if (!thingList) return;
            thingList.forEach((item) => {
                if ([1, 2].includes(item.itemType)) {
                    const { familyid } = item.itemData.family;
                    const device = _.cloneDeep(item) as IEWeLinkDevice;
                    device.familyName = familyObj[familyid];

                    deviceList.push(device);
                }
            });
        }
        //存入数据库
        db.setDbValue('eWeLinkDeviceList', deviceList);

        // logger.info(
        //     '拿到的ewelink的所有设备--------------------------',
        //     deviceList.map((item) => item.itemData.deviceid + '---------' + item.itemData.name)
        // );

        return deviceList;
    } catch (error: any) {
        logger.error('请求ewelink接口到时候报错---------------------------', error);
        return null;
    }
};
