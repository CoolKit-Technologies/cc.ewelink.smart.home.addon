import cryptoJS from 'crypto-js';
import _ from 'lodash';
import { NextFunction, Request, Response } from 'express';
import EApiPath from '../ts/enum/EApiPath';
import { toResponse } from '../utils/error';
import logger from '../utils/logger';
import db from '../utils/db';
import config from '../config';

function atExpired() {
    const AT_LIFETIME = 86400000 * 30; // 30 day
    return Date.now() > db.getDbValue('atUpdateTime') + AT_LIFETIME;
}

function getSign(params: any, appSecret: string) {
    let sign = '';
    try {
        Object.keys(params)
            .sort()
            .forEach((key) => {
                const value = _.get(params, key);
                sign += `${key}${typeof value === 'object' ? JSON.stringify(value) : value}`;
            });
        ``;
        sign = cryptoJS
            .MD5(`${appSecret}${encodeURIComponent(sign)}${appSecret}`)
            .toString()
            .toUpperCase();
    } catch (err) {
        logger.error('got error here', err);
    }

    return sign;
}

/**
 *
 * 鉴权
 * @date 17/11/2022
 * @export
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {*}
 */
export default async function oauth(req: Request, res: Response, next: NextFunction) {
    const { headers, path, method, query, body } = req;
    const headerSign = headers['sign'] as string;
    const params = method === 'GET' ? query : body;
    const { appid } = params;
    const { appId, appSecret } = config.auth;

    //开放给后端控制设备的接口，不用鉴权
    const { directive = null } = body;
    if (directive) {
        return next();
    }

    // 检验sign是否存在
    if (!headerSign) {
        logger.error('oauth error: sign in headers is required');
        return res.json(toResponse(401, 'sign in headers is required'));
    }

    // 校验sign的格式
    const [signTitle, sign] = headerSign.split(' ');

    if (signTitle !== 'Sign' || !sign) {
        logger.error('oauth error: sign in headers is not in right format');
        return res.json(toResponse(401, "sign in headers must begin with 'Sign'"));
    }

    // 计算并比较sign
    const curSign = getSign(params, appSecret);
    if (curSign !== sign) {
        logger.error('oauth error: sign in headers is invalid!');
        return res.json(toResponse(401, 'sign in headers is invalid'));
    }

    // 检测appid
    if (!appid) {
        logger.error('oauth error: appid is missing');
        return res.json(toResponse(401, 'sign in headers is invalid'));
    }

    // 比较appid
    if (appid !== appId) {
        logger.error('oauth error: appid is invalid');
        return res.json(toResponse(401, 'appid is invalid'));
    }

    // 用户相关接口以及获取局域网设备信息接口不需要鉴权at
    if (req.path.includes('/user') || req.path === '/api/v1' + EApiPath.SCAN_LAN_DEVICE) return next();

    // 检测at是否存在
    const headerAt = headers['authorization'];
    if (!headerAt) {
        logger.error('oauth error: authorization in headers is required');
        return res.json(toResponse(401, 'authorization in headers is required'));
    }

    // 检测at格式是否正确
    const [atTitle, at] = headerAt.split(' ');
    if (atTitle !== 'Bearer' || !at) {
        logger.error('oauth error: authorization in headers is not in right format');
        return res.json(toResponse(401, "authorization in headers must begin with 'Bearer'"));
    }

    // 跟存储的at做比较
    const eWeLinkApiInfo = db.getDbValue('eWeLinkApiInfo');
    if (!eWeLinkApiInfo || at !== eWeLinkApiInfo.at) {
        logger.error('oauth error: access token is invalid');
        return res.json(toResponse(401, 'access token is invalid'));
    }

    // 检测at是否过期
    if (atExpired()) {
        logger.error('oauth error: your access token is expired, please login again');
        return res.json(toResponse(401, 'your access token is expired, please login again'));
    }

    return next();
}
