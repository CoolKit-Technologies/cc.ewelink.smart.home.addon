import _, { at } from 'lodash';
import { NextFunction, Request, Response } from 'express';
import logger from '../utils/logger';
import db from '../utils/db';
import CkApi from './../lib/coolkit-api';

function atExpired() {
    const AT_LIFETIME = 86400000 * 15; // 15 day
    return Date.now() > db.getDbValue('atUpdateTime') + AT_LIFETIME;
}

/**
 *
 * 刷新at
 * @export
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @return {*}
 */
export default async function refreshEWeLinkToken(req: Request, res: Response, next: NextFunction) {
    if (!atExpired()) {
        return next();
    }
    const refreshRes = await CkApi.user.refresh();
    if (refreshRes.error !== 0) {
        return next();
    }
    const { at, rt } = refreshRes.data;

    db.setDbValue('atUpdateTime', Date.now());

    const eWeLinkApiInfo = db.getDbValue('eWeLinkApiInfo');
    if (!eWeLinkApiInfo) {
        return next();
    }
    eWeLinkApiInfo.at = at;
    eWeLinkApiInfo.rt = rt;

    db.setDbValue('eWeLinkApiInfo', eWeLinkApiInfo);

    return next();
}
