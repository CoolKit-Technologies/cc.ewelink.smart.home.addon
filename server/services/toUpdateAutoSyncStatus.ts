import { NextFunction, Request, Response } from 'express';
import autoSyncRun from '../utils/autoSyncRun';
import db from '../utils/db';
import { toResponse } from '../utils/error';
import logger from '../utils/logger';

export default async function toUpdateAutoSyncStatus(req: Request, res: Response, next: NextFunction) {
    try {
        const { autoSyncStatus } = req.body;

        const iHostToken = db.getDbValue('iHostToken');

        if (!iHostToken) {
            return res.json(toResponse(1100));
        }

        db.setDbValue('autoSyncStatus', autoSyncStatus);

        if (autoSyncStatus) {
            autoSyncRun();
        }

        res.json(toResponse(0));
    } catch (error: any) {
        logger.error(`更新自动同步状态执行代码过程中报错------------------- ${error.message}`);
        res.json(toResponse(500));
    }
}
