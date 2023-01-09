/** 单通道开关的state */
export interface IHostStateSingleSwitch {
    power: {
        powerState: 'on' | 'off';
    };
}

/** 多通道开关的state */
export interface IHostStateMultipleSwitch {
    power?: {
        powerState: 'on' | 'off';
    };
    toggle?: {
        [key: number]: { toggleState: 'on' | 'off' };
    };
}
