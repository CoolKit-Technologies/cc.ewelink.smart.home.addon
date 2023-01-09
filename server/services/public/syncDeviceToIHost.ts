import _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import deviceDataUtil from '../../utils/deviceDataUtil';
import { syncDeviceToIHost } from '../../api/iHost';
import logger from '../../utils/logger';

/** 同步eWeLink设备到iHost */
export default async (deviceIdList: string[]) => {
    try {
        const endpoints: any = [];

        deviceIdList.forEach((item) => {
            const endpointObj = deviceDataUtil.generateSyncIHostDeviceData(item);
            if (endpointObj) {
                endpoints.push(endpointObj);
            }
        });

        if (endpoints.length === 0) {
            return null;
        }

        const params = {
            event: {
                header: {
                    name: 'DiscoveryRequest',
                    message_id: uuidv4(),
                    version: '1',
                },
                payload: {
                    endpoints,
                },
            },
        };

        const res = await syncDeviceToIHost(params);

        return res;
    } catch (error: any) {
        logger.error('同步设备到iHost的时候报错-----------------------------', deviceIdList, error);
        return null;
    }
};
