import { defineStore } from 'pinia';
import type { IBeforeLoginDevice, IAfterLoginDevice } from '@/ts/interface/IDevice';
import api from '../api';
import _ from 'lodash';

interface IDeviceState {
    /** 登录前的设备列表 */
    beforeLoginDeviceList: IBeforeLoginDevice[];
    /** 登录后的设备列表 */
    afterLoginDeviceList: IAfterLoginDevice[];
    /** 登录前轮询设备列表的返回值 */
    beforeLoginDeviceListInterval: number;
    /** 登录后轮询设备列表的返回值 */
    afterLoginDeviceListInterval: number;
    /** 用户是否打开隐藏不可用的设备 */
    isFilter: boolean;
    /** 网关缺少凭证时弹框后确认凭证重启调用同步接口需要的设备Id */
    waitSyncDeviceId: string;
}

export const useDeviceStore = defineStore('addon_device', {
    state: (): IDeviceState => {
        return {
            beforeLoginDeviceList: [],
            afterLoginDeviceList: [],
            beforeLoginDeviceListInterval: 0,
            afterLoginDeviceListInterval: 0,
            isFilter: false,
            waitSyncDeviceId: '',
        };
    },
    actions: {
        async getBeforeLoginDeviceList() {
            const res = await api.smartHome.getAllLanDeviceBeforeLogin();
            if (res.data && res.error === 0) {
                this.beforeLoginDeviceList = res.data.deviceList;
            }
        },
        async getAfterLoginDeviceList() {
            const res = await api.smartHome.getAllLanDeviceAfterLogin();
            console.log(res.data,'res.data');
            
            if (res.data && res.error === 0) {
                const isMyAccountDeviceList = res.data.deviceList.filter((item) => {
                    return item.isMyAccount&&item.isSupported;
                });
                const noMyAccountDeviceList = res.data.deviceList.filter((item) => {
                    return !item.isMyAccount;
                });
                const isNotSupportedDeviceList = res.data.deviceList.filter((item) => {
                    return item.isMyAccount&&!item.isSupported;;
                });
                // this.afterLoginDeviceList = res.data.deviceList;
                this.afterLoginDeviceList = [...isMyAccountDeviceList, ...noMyAccountDeviceList, ...isNotSupportedDeviceList];
            }

            // if (res.data && res.error === 0) {
            //     this.afterLoginDeviceList = res.data.deviceList;
            // }
        },
        setBeforeLoginDeviceListInterval(num: number) {
            this.beforeLoginDeviceListInterval = num;
        },
        setAfterLoginDeviceListInterval(num: number) {
            this.afterLoginDeviceListInterval = num;
        },
        setIsFilter(state: boolean) {
            this.isFilter = state;
        },
        setWaitSyncDeviceId(deviceId: string) {
            this.waitSyncDeviceId = deviceId;
        },
    },

    getters: {
        filterAfterLoginDeviceList(state) {
            return state.afterLoginDeviceList.filter((device) => {
                return device.isMyAccount && device.isSupported;
            });
        },
    },
    persist: true,
});
