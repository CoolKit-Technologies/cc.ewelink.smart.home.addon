import fs from 'fs';
import path from 'path';
import express from 'express';
import logger from './utils/logger';
import info from './middleware/info';
import router from './routes';
import { internalError, notFound } from './middleware/error';
import config from './config';
import { encode } from 'js-base64';
import { dbDataTmp } from './utils/db';
import oauth from './middleware/oauth';
import CkApi from './lib/coolkit-api';
import db from './utils/db';
import _ from 'lodash';
import gapTimeRun from './utils/gapTimeRun';
import refreshEWeLinkToken from './middleware/refreshEWeLinkToken';

const app = express();
const port = config.nodeApp.port;

// 配置持久化所需文件
const dataPath = path.join(__dirname, 'data');
const dbPath = path.join(__dirname, 'data', 'db.json');
config.nodeApp.dataPath = dataPath;
config.nodeApp.dbPath = dbPath;

if (!fs.existsSync(dataPath)) {
    fs.mkdirSync(dataPath);
}

if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, encode(JSON.stringify(dbDataTmp)), 'utf-8');
}

// 将body解析为json格式
app.use(express.json());

// 加载静态文件
app.use(express.static(path.join(__dirname, 'public')));

// 记录传入参数
app.use(info);

// 鉴权校验
app.use(oauth);

// 有请求的时候刷新at
app.use(refreshEWeLinkToken);

// 路由处理
app.use('/api/v1', router);

// 错误处理
app.use(notFound);
app.use(internalError);

app.listen(port, '0.0.0.0', () => {
    logger.info(`Server is running at http://localhost:${port}----${config.nodeApp.env}`);

    // 初始化 coolkit api
    //记住登录状态，防止重启后端服务后得重新登录
    const eWeLinkApiInfo = db.getDbValue('eWeLinkApiInfo');

    let initParams = {
        appId: config.coolKit.appId,
        appSecret: config.coolKit.appSecret,
        useTestEnv: config.nodeApp.env === 'dev',
        timeout: 30000,
    };

    if (eWeLinkApiInfo) {
        _.merge(initParams, eWeLinkApiInfo);
    }

    CkApi.init(initParams);
    gapTimeRun();
});
