/** 单通道开关或插座的局域网state数据 */
export interface ILanStateSingleSwitch {
    switch: 'on' | 'off';
    // startup: 'off';
    // pulse: 'off';
    // pulseWidth: number;
    rssi: number;
}


/** 多通道开关或插座的局域网state数据 */
export interface ILanStateMultipleSwitch {
    // sledOnline: 'on',
    // configure: [
    //   { startup: 'off', outlet: 0 },
    //   { startup: 'off', outlet: 1 },
    //   { startup: 'off', outlet: 2 },
    //   { startup: 'off', outlet: 3 }
    // ],
    // pulses: [
    //   { pulse: 'off', width: 1000, outlet: 0 },
    //   { pulse: 'off', width: 1000, outlet: 1 },
    //   { pulse: 'off', width: 1000, outlet: 2 },
    //   { pulse: 'off', width: 1000, outlet: 3 }
    // ],
    switches: { switch: 'on'|'off', outlet: number }[]
}