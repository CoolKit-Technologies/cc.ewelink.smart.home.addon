import type { IAfterLoginDevice } from '@/ts/interface/IDevice';
import { getAssetsFile } from '@/utils/tools';

/**
 *
 * 根据DeviceInfo获取设备卡片对应的图片
 * @date 23/11/2022
 * @export
 * @param {IAfterLoginDevice} deviceInfo
 * @returns {*}
 */
export function getDeviceImg(deviceInfo: IAfterLoginDevice) {
    if (deviceInfo.isOnline && deviceInfo.isSupported && deviceInfo.isMyAccount) {
        switch (deviceInfo.displayCategory) {
            /**开关插座 */
            case 'switch':
                return getAssetsFile('img/switch.png');
            /**无线开关 */
            case 'button':
                return getAssetsFile('img/button.png');
            /**风扇灯 */
            case 'fanLight':
                return getAssetsFile('img/fanLight-offline.png');
            /**灯 */
            case 'light':
                return getAssetsFile('img/light.png');
            default:
                return getAssetsFile('img/switch.png');
        }
    } else {
        switch (deviceInfo.displayCategory) {
            case 'switch':
                return getAssetsFile('img/switch-offline.png');
            case 'button':
                return getAssetsFile('img/button-offline.png');
            case 'fanLight':
                return getAssetsFile('img/fanLight-offline.png');
            case 'light':
                return getAssetsFile('img/light-offline.png');
            default:
                return getAssetsFile('img/switch-offline.png');
        }
    }
}
