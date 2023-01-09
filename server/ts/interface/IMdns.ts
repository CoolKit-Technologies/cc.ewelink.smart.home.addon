import ELanType from '../enum/ELanType';
export interface IMdnsRes {
    ptr: string;
    txt: {
        txtvers: number;
        id: string;
        type: ELanType;
        apivers: number;
        seq: number;
        encrypt: true;
        iv: string;
        data1?: string;
        data2?: string;
        data3?: string;
        data4?: string;
    };
    srv: {
        priority: number;
        weight: number;
        port: number;
        target: string;
    };
    a: string;
}

export interface IMdnsParseRes {
    /** 设备id */
    deviceId: string;
    /** 设备类型 */
    type: ELanType;
    /** 已加密的数据 */
    encryptedData: string;
    /** 设备ip */
    ip: string;
    /** 端口 */
    port: number;
    /** 目标地址 */
    target: string;
    /** 加密时初始化向量的 Base64 值 */
    iv: string;
    /** 是否在线 */
    isOnline?: boolean;
}
