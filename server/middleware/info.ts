import { NextFunction, Request, Response } from 'express';
import logger from '../utils/logger';
import _ from 'lodash';

export default (req: Request, res: Response, next: NextFunction) => {
    logger.info('==================request info begin===================');
    const { params, body, method, url } = req;
    logger.info(`incoming request info: ${method} ${url}`);
    if (!_.isEmpty(params)) {
        logger.info(`incoming request params: ${JSON.stringify(params, null, 2)}`);
    }
    if (!_.isEmpty(body)) {
        logger.info(`incoming request body: ${JSON.stringify(body, null, 2)}`);
    }

    next();
};
