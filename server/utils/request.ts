import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import EMethod from '../ts/enum/EMethod';
import db from '../utils/db';
import config from '../config';
import logger from './logger';

export interface ApiResponse<T> {
    error: number;
    data?: T;
    message: string;
}

axios.defaults.baseURL = config.iHost.api;
axios.defaults.timeout = 60000;

// 请求拦截器，在请求发出之前添加 Authorization 请求头
axios.interceptors.request.use((request: AxiosRequestConfig) => {
    // 白名单请求路径，不需要添加 Authorization 请求头
    const whitelist = ['/bridge/access_token'];

    const at = db.getDbValue('iHostToken');
    if (request.headers && whitelist.indexOf(request.url as string) < 0) {
        request.headers['Authorization'] = at ? `Bearer ${at}` : '';
    }

    // logger.info("the whole db => ", db.getDb());

    return request;
});

/**
 * 通用请求方法,带有error
 */
export async function request<RespData>(url: string, method: EMethod, params?: any) {
    const axiosConfig = {
        url,
        method,
        params,
        headers: {
            'Content-Type': 'application/json',
        },
    } as AxiosRequestConfig;

    if (method === EMethod.POST || method === EMethod.PUT || method === EMethod.DELETE) {
        delete axiosConfig.params;
        axiosConfig['data'] = params;
    }
    try {
        const res = await axios(axiosConfig);
        return res ? (res.data as ApiResponse<RespData>) : ({} as ApiResponse<RespData>);
    } catch (error) {
        logger.error('请求ihost报错  ----------------------------', error);

        return {} as ApiResponse<RespData>;
    }
}

/**
 * 三方请求网关接口
 */
export async function requestNoError<RespData>(url: string, method: EMethod, params?: any) {
    const axiosConfig = {
        url,
        method,
        params,
        headers: {
            'Content-Type': 'application/json',
        },
    } as AxiosRequestConfig;

    if (method === EMethod.POST || method === EMethod.PUT || method === EMethod.DELETE) {
        delete axiosConfig.params;
        axiosConfig['data'] = params;
    }

    try {
        const res = await axios(axiosConfig);
        return res ? (res.data as RespData) : ({} as RespData);
    } catch (error) {
        logger.error('请求ihost报错 ----------------------------------------', error);

        return {} as RespData;
    }
}
