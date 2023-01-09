import { NextFunction, Request, Response } from 'express';
import { getPermissionApi } from '../api/iHost';
import db from '../utils/db';
import { toResponse } from '../utils/error';
import logger from '../utils/logger';

export default async function getPermission(req: Request, res: Response, next: NextFunction) {
    try {
        const iHostToken = db.getDbValue('iHostToken');
        if (iHostToken) {
            return res.json(toResponse(0));
        }
        const { error, message, data } = await getPermissionApi();

        if (data?.token) {
            db.setDbValue('iHostToken', data.token);
        }
        if ([400, 401].includes(error)) {
            logger.error('获取凭证没有权限------------------------了', error);
            return res.json(toResponse(1100));
        }

        return res.json(toResponse(0, message));
    } catch (error: any) {
        logger.error(`获取凭证报错----------------: ${error.message}`);
        res.json(toResponse(500));
    }
}
