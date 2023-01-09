export const prodConf = {
    nodeApp: {
        env: 'prod',
        port: 8321,
        dataPath: '',
        dbPath: '',
    },
    coolKit: {
        appId: 'apply on https://dev.ewelink.cc/#/',
        appSecret: 'apply on https://dev.ewelink.cc/#/',
    },
    auth: {
        appId: 'create-by-yourself',
        appSecret: 'create-by-yourself',
    },
    iHost: {
        api: 'http://ihost/open-api/v1/rest',
    },
    log: {
        path: 'data/total_prod.log',
        pattern: '.yyyy-MM-dd.log',
    },
    timeConfig: {
        /** mDns多久搜索不到就,设置为离线 单位秒 */
        disappearTime: 10 * 60,
        /** mDns间隔多久扫描一次,单位秒 */
        mDnsGapTime: 30,
        /** 多久调用一次易微连api接口,单位秒 */
        eweLinkGapTime: 30,
        /** 多久调用一次iHost接口,单位秒 */
        iHostGapTime: 30,
        /** 多久运行自动同步,单位秒 */
        autoSyncGapTime: 30,
        /** 多久运行自动取消同步程序,单位秒 */
        autoCancelSyncGapTime: 30,
    },
    /** 启动的ip */
    localIp: 'http://ihost:8321',
};
