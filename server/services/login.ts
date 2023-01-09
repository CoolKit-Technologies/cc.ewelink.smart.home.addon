import { NextFunction, Request, Response } from 'express';
import { toResponse } from '../utils/error';
import CkApi from '../lib/coolkit-api';
import logger from '../utils/logger';
import db from '../utils/db';
import config from '../config';
import getEwelinkAllDeviceList from './public/getEwelinkAllDeviceList';

export default async function login(req: Request, res: Response, next: NextFunction) {
    const { account } = req.params;
    const { countryCode, password } = req.body;
    const loginParams = {
        countryCode,
        password,
    };

    if (account.includes('@')) {
        // 使用邮箱登录
        Object.assign(loginParams, { email: account });
    } else {
        // 使用手机号登录
        Object.assign(loginParams, { phoneNumber: `${countryCode}${account}` });
    }

    try {
        const { error, data, msg } = await CkApi.user.login(loginParams);
        const autoSyncStatus = db.getDbValue('autoSyncStatus');

        if (error !== 0 || !data) {
            //登录密码错误
            if (error === 10001 || error === 10014) {
                return res.json(toResponse(1001, msg, data));
            }
            //帐号格式有误
            if (error === 400) {
                return res.json(toResponse(1002, msg, data));
            }
            //用户不存在
            if (error === 10003) {
                return res.json(toResponse(1003, msg, data));
            }

            return res.json(toResponse(error, msg, data));
        }

        const account = data.user.phoneNumber ? data.user.phoneNumber : data.user.email;
        if (!account) {
            throw new Error();
        }
        const userInfo = {
            account,
            autoSyncStatus,
        };

        db.setDbValue('eWeLinkApiInfo', {
            at: data.at,
            rt: data.rt,
            region: data.region,
            userInfo,
        });

        db.setDbValue('atUpdateTime', Date.now());

        // 重新初始化 coolkit api
        CkApi.init({
            at: data?.at,
            rt: data?.rt,
            region: data?.region,
            appId: config.coolKit.appId,
            appSecret: config.coolKit.appSecret,
            useTestEnv: config.nodeApp.env === 'dev',
            timeout: 30000,
        });
        await getEwelinkAllDeviceList();

        const response = {
            userInfo,
            at: data.at,
        };

        res.json(toResponse(error, msg, response));
    } catch (error: any) {
        logger.error(`登录接口执行代码过程中报错--------------------- ${error.message}`);
        res.json(toResponse(500));
    }
}
