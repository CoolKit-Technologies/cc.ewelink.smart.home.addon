// import DeviceMapClass from '../ts/class/deviceMap';
// import dayjs from 'dayjs';
// import { IMdnsParseRes } from '../ts/interface/IMdns';
// import syncDeviceOnlineToIHost from '../services/public/syncDeviceOnlineToIHost';
// import deviceDataUtil from './deviceDataUtil';
// import config from '../config';
// import logger from './logger';

// const { offlineTime, disappearTime } = config.timeConfig;


// //更新已搜索到的设备列表
// function updateDeviceMap(params: IMdnsParseRes) {
//     params.isOnline = true;
  
//     DeviceMapClass.deviceMap.set(params.deviceId, {
//         discoveryTime: Date.now(),
//         deviceData: params,
//     });

//     const deviceList = [...DeviceMapClass.deviceMap].map((item) => {
//         return {
//             deviceId: item[0],
//             discoveryTime: item[1].discoveryTime,
//             deviceData: item[1].deviceData,
//         };
//     });

//     const IHostDeviceData = deviceDataUtil.getIHostDeviceDataByDeviceId(params.deviceId);

//     if (IHostDeviceData) {
//         logger.error('设备搜索到同步在线状态给iHost------------------', IHostDeviceData);
//         syncDeviceOnlineToIHost(params.deviceId, IHostDeviceData.serial_number, true);
//     }

//     if (deviceList.length === 0) return;
//     const nowTime = Date.now();
//     deviceList.forEach((item) => {
//         const seconds = dayjs(nowTime).diff(dayjs(item.discoveryTime), 'seconds');
//         //超过离线时间，设置为离线
//         if (seconds > offlineTime) {
//             params.isOnline = false;
//             DeviceMapClass.deviceMap.set(item.deviceId, {
//                 discoveryTime: item.discoveryTime,
//                 deviceData: params,
//             });

//             if (IHostDeviceData) {
//                 logger.info('设备消失一段时间将离线状态给iHost--------------------', IHostDeviceData);
//                 syncDeviceOnlineToIHost(params.deviceId, IHostDeviceData.serial_number, false);
//             }
//         }

//         //超过最大没发现时间，清除出队列
//         if (seconds > disappearTime) {
//             DeviceMapClass.deviceMap.delete(item.deviceId);
//             if (IHostDeviceData) {
//                 logger.info('设备消失时间过长同步离线状态给iHost-------------------------', IHostDeviceData);
//                 syncDeviceOnlineToIHost(params.deviceId, IHostDeviceData.serial_number, false);
//             }
//         }
//     });

// }

// /** 获取已搜索到的局域网设备 */
// function getMDnsDeviceList() {
//     let arr: any = Array.from(DeviceMapClass.deviceMap.entries());
//     arr = arr.map((item: any) => {
//         return {
//             deviceId: item[0],
//             ...item[1],
//         };
//     });
//     return arr as {
//         deviceId: string;
//         discoveryTime: number;
//         deviceData: IMdnsParseRes;
//     }[];
// }

// /** 根据设备id获取设备的局域网信息 */
// function getMDnsDeviceDataByDeviceId(deviceId: string) {
//     const mDnsDeviceList = getMDnsDeviceList();
//     const thisItem = mDnsDeviceList.find((item) => {
//         return item.deviceId === deviceId;
//     });
//     if (!thisItem) {
//         logger.error('🚀 ~ file: deviceMapUtil.ts ~ line 62 ~ getMDnsDeviceDataByDeviceId ~ mDnsDeviceList', mDnsDeviceList);
//         return null;
//     }

//     return thisItem;
// }
// export default {
//     updateDeviceMap,
//     getMDnsDeviceList,
//     getMDnsDeviceDataByDeviceId,
// };
