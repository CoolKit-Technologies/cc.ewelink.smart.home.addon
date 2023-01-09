import {
    configure,
    getLogger
} from 'log4js';
import config from '../config/index';


configure({
    appenders: {
        total: {
            type: 'dateFile',
            filename: config.log.path,
            pattern: config.log.pattern
        },
        console: {
            type: "console"
        }
    },
    categories: {
        default: {
            appenders: ['total', 'console'],
            level: 'info'
        }
    }
});

/*
 * 使用方法：
 *      log.info('info message');
 *      log.error('error message');
 */
const logger = getLogger('total');
export default logger;
