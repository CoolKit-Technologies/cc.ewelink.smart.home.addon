import logger from '../utils/logger';
import { NextFunction, Request, Response } from 'express';

export function notFound(req: Request, res: Response, next: NextFunction) {
    logger.error(`404 bad request: ${req.url}`, 'error');
    res.status(404).json({
        error: 404,
        msg: 'not found',
        data: {}
    });
}

export function internalError(err: Error, req: Request, res: Response, next: NextFunction) {
    logger.error('500 server internal error', 'error');
    res.status(500).json({
        error: 500,
        msg: 'server internal error',
        data: {}
    });
}
