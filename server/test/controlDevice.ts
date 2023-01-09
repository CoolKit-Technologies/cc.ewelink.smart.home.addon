import axios from 'axios';
import logger from '../utils/logger';
import mDnsDataParse from '../utils/mDnsDataParse';


const controlDevice = async () => {
    const iv = `abcdef${Date.now()}abcdef`.slice(0, 16);
    const deviceid = 'deviceid';
    const selfApikey = 'apikey';
    const devicekey = 'apikey';
    const data = JSON.stringify({ switch: 'on' });
    const ip = 'ip';
    const port = 8081;


    const reqData = {
        iv: mDnsDataParse.encryptionBase64(iv),
        deviceid,
        selfApikey,
        encrypt: true,
        sequence: `${Date.now()}`,
        data: mDnsDataParse.encryptionData({
            iv,
            data,
            key: devicekey,
        }),
    };

    const res = await axios.post(`http://${ip}:${port}/zeroconf/switch`, reqData);
    logger.error('setSwitch------------------------', res);
};

controlDevice();
