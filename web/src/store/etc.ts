import { defineStore } from 'pinia';
import i18n from '@/i18n';
import type { IUser } from '@/ts/interface/IUser';
import api from '@/api';
import { useDeviceStore } from './device';
interface IEtcState {
    language: 'zh-cn' | 'en-us';
    /* 顶部卡片控制变量 */
    tipCardVisible: boolean;
    at: string;
    isLogin: boolean;
    userInfo: IUser;
    isLoading: boolean;
    getAccessTokenVisible:boolean;
    getAccessTokenTimeNumber:number;
    getAccessTokenNumber:number;
}

export const useEtcStore = defineStore('addon_etc', {
    state: (): IEtcState => {
        return {
            /** 国际化语言 */
            language: 'zh-cn',
            /** 是否显示提示卡片 */
            tipCardVisible: true,
            /** 登录凭证 */
            at: '',
            /** 是否登录 */
            isLogin: false,
            /** 用户信息 */
            userInfo: {
                account: '',
                autoSyncStatus: false,
            },
            /** 控制context Loading变量 */
            isLoading: false,
            /** 控制获取凭证弹窗变量 */
            getAccessTokenVisible:false,
            /** 轮询获取凭证接口返回值 */
            getAccessTokenTimeNumber:0,
            /** 获取凭证已轮询次数 */
            getAccessTokenNumber:0,
        };
    },
    getters: {},
    actions: {
        /** 修改国际化语言 */
        languageChange(language: 'zh-cn' | 'en-us') {
            this.language = language;
            i18n.global.locale = language;
        },
        setTipCardVisible(state: boolean) {
            this.tipCardVisible = state;
        },
        setAt(at: string) {
            this.at = at;
        },
        setLoginState(state: boolean) {
            this.isLogin = state;
        },
        setUserInfo(userInfo: IUser) {
            this.userInfo = userInfo;
        },
        setGetAccessTokenVisible(state: boolean) {
            this.getAccessTokenVisible = state;
        },
        setGetAccessTokenTimeNumber(num: number) {
            this.getAccessTokenTimeNumber = num;
        },
        setGetAccessTokenNumber(num: number) {
            this.getAccessTokenNumber = num;
        },
        
        async logOut() {
            const res = await api.smartHome.logOut();
            if (res.error === 0) {
                const deviceStore = useDeviceStore()
                clearInterval(deviceStore.afterLoginDeviceListInterval);
                return new Promise((resolve) => {
                    setTimeout(() => {
                        window.localStorage.removeItem('addon_etc');
                        window.localStorage.removeItem('addon_device');
                        // this.isLogin = false;
                        // this.userInfo = {
                        //     account: '',
                        // };
                        // this.at = '';
                        location.reload();
                        resolve(1);
                    }, 1500);
                });
            }
        },
        setAutoSyncStatus(state: boolean) {
            this.userInfo.autoSyncStatus = state;
        },
        setIsLoading(state: boolean) {
            this.isLoading = state;
        },
    },
    persist: true,
});
