import EMethod from '../ts/enum/EMethod';
import { request, requestNoError } from '../utils/request';
import IHostDevice from '../ts/interface/IHostDevice';

export const getPermissionApi = () => {
    return request<{ token: string }>('/bridge/access_token', EMethod.GET);
};

interface SyncDeviceToIHostReq {
    event: {
        header: {
            name: string;
            message_id: string;
            version: string;
        };
        payload: {
            endpoints: {
                third_serial_number: string;
                name: string;
                display_category: string;
                capabilities: {
                    capability: string;
                    permission: string;
                    name?: number;
                }[];
                state: null | any;
                tags: {
                    /** 同步的时候传 */
                    deviceInfo: string;
                };
                firmware_version: string;
                service_address: string;
            }[];
        };
    };
}

interface SyncDeviceToIHostRes {
    header: {
        name: 'Response' | 'ErrorResponse';
        message_id: string;
        version: string;
    };
    payload: {
        endpoints: {
            serial_number: string;
            third_serial_number: string;
        }[];
        //错误时只返回以下两项
        type?: string;
        description?: string;
    };
}

export const syncDeviceToIHost = (params: SyncDeviceToIHostReq) => {
    return requestNoError<SyncDeviceToIHostRes>('/thirdparty/event', EMethod.POST, params);
};

interface SyncDeviceOnlineToIHostReq {
    event: {
        header: {
            name: string;
            message_id: string;
            version: string;
        };
        endpoint: {
            serial_number: string;
            third_serial_number: string;
        };
        payload: {
            online: boolean;
        };
    };
}

interface SyncDeviceOnlineToIHostRes {
    header: {
        name: 'Response';
        message_id: string;
        version: string;
    };
    payload: {};
}

export const syncDeviceOnlineToIHost = (params: SyncDeviceOnlineToIHostReq) => {
    return requestNoError<SyncDeviceOnlineToIHostRes>('/thirdparty/event', EMethod.POST, params);
};

export const getIHostSyncDeviceList = () => {
    return request<{ device_list: IHostDevice[] }>('/devices', EMethod.GET);
};

interface SyncDeviceStateToIHostReq {
    event: {
        header: {
            name: string;
            message_id: string;
            version: string;
        };
        endpoint: {
            serial_number: string;
            third_serial_number: string;
        };
        payload: {
            state: any;
        };
    };
}

interface SyncDeviceStateToIHostRes {
    header: {
        name: 'Response';
        message_id: string;
        version: string;
    };
    payload: {};
}

export const syncDeviceStateToIHost = (params: SyncDeviceStateToIHostReq) => {
    return requestNoError<SyncDeviceStateToIHostRes>('/thirdparty/event', EMethod.POST, params);
};

export const deleteDevice = (serialNumber: string) => {
    return request(`/devices/${serialNumber}`, EMethod.DELETE);
};
