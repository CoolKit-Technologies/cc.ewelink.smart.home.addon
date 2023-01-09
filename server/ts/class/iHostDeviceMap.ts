//内存中保存已同步给iHost的设备状态信息

interface IHostStateMap {
    state: {
        power?: {
            powerState: 'on' | 'off';
        };
        toggle?: {
            [key: number]: { toggleState: 'on' | 'off' };
        };
        rssi?: {
            rssi: number;
        };
    };
}

class iHostDeviceMapClass {
    public deviceMap: Map<string, IHostStateMap>;
    constructor() {
        this.deviceMap = new Map();
    }
}
export default new iHostDeviceMapClass();
