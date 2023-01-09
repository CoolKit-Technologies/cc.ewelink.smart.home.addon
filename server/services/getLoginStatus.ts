import { NextFunction, Request, Response } from 'express';
import db from '../utils/db';
import { toResponse } from '../utils/error';
import logger from '../utils/logger';

export default async function getLoginStatus(req: Request, res: Response, next: NextFunction) {
    try {
        const eWeLinkApiInfo = db.getDbValue('eWeLinkApiInfo');
        const autoSyncStatus = db.getDbValue('autoSyncStatus');
        if (!eWeLinkApiInfo) {
            res.json(
                toResponse(0, 'success', {
                    loginStatus: false,
                })
            );
            return;
        }

        res.json(
            toResponse(0, 'success', {
                loginStatus: true,
                userInfo: {
                    account: eWeLinkApiInfo.userInfo.account,
                    autoSyncStatus: !!autoSyncStatus,
                },
                at: eWeLinkApiInfo.at,
            })
        );
    } catch (error: any) {
        logger.error(`获取ihost凭证报错------------------------- ${error.message}`);
        res.json(toResponse(500));
    }
}
