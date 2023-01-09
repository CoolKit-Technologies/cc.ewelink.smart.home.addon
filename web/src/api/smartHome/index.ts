import { beforeLoginRequest, afterLoginRequest } from '../public';
import type { IBeforeLoginDevice, IAfterLoginDevice } from '@/ts/interface/IDevice';
import type { IUser, ILoginWithAccountParams } from '@/ts/interface/IUser';
import EReqMethod from '../ts/enum/EReqMethod';

interface IBeforeLoginDeviceListData {
    deviceList: IBeforeLoginDevice[];
}
interface IAfterLoginDeviceListData {
    deviceList: IAfterLoginDevice[];
}

interface ILoginWithAccountData {
    userInfo: IUser;
    at: string;
}

interface IGetLoginStatusData {
    loginStatus: boolean;
    userInfo: IUser;
    at: string;
}

/**
 * 获取所有局域网设备(登录前)
 */
async function getAllLanDeviceBeforeLogin() {
    return await beforeLoginRequest<IBeforeLoginDeviceListData>(`/device/lan`, {}, EReqMethod.GET);
}

/**
 * 账号登录
 */
async function loginWithAccount(params: ILoginWithAccountParams) {
    return await beforeLoginRequest<ILoginWithAccountData>(`/user/${params.account}/account`, params, EReqMethod.POST);
}

/**
 * 获取登录状态
 */
async function getLoginStatus() {
    return await beforeLoginRequest<IGetLoginStatusData>(`/user/status`, {}, EReqMethod.GET);
}

/**
 * 获取所有局域网设备(登录后)
 */
async function getAllLanDeviceAfterLogin() {
    return await afterLoginRequest<IAfterLoginDeviceListData>(`/device`, {}, EReqMethod.GET);
}

/**
 * 账号退出
 */
 async function logOut() {
    return await beforeLoginRequest(`/user`, {}, EReqMethod.PUT);
}


/**
 * 获取 iHost 网关凭证
 */
async function getIhostAccessToken() {
    return await afterLoginRequest(`/user/access-token`, {}, EReqMethod.GET);
}

/**
 * 同步单个设备
 */
async function syncSingleDevice(deviceId: string) {
    return await afterLoginRequest(`/device/${deviceId}/sync`, {}, EReqMethod.POST);
}

/**
 * 自动同步所有设备
 */
async function syncAllDevice() {
    return await afterLoginRequest(`/device/sync`, {}, EReqMethod.POST);
}

/**
 * 取消同步单个设备
 */
async function cancelSyncSingleDevice(deviceId: string) {
    return await afterLoginRequest(`/device/${deviceId}`, {}, EReqMethod.DELETE);
}

/**
 * 取消同步所有设备
 */
async function cancelSyncAllDevice() {
    return await afterLoginRequest(`/device`, {}, EReqMethod.DELETE);
}

/**
 * 取消同步单个设备
 */
async function autoSyncAllDevice(state: boolean) {
    return await afterLoginRequest(`/device/sync-status`, { autoSyncStatus: state }, EReqMethod.PUT);
}

export default {
    getAllLanDeviceBeforeLogin,
    loginWithAccount,
    getLoginStatus,
    getAllLanDeviceAfterLogin,
    getIhostAccessToken,
    syncSingleDevice,
    syncAllDevice,
    cancelSyncSingleDevice,
    cancelSyncAllDevice,
    autoSyncAllDevice,
    logOut,
};
