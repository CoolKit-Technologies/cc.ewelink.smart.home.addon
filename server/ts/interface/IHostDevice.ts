export default interface IHostDevice {
    serial_number: string;
    name: null | string;
    manufacturer: string;
    model: string;
    firmware_version: string;
    display_category: string;
    capabilities: [
        {
            capability: string;
            permission: 'readWrite' | 'read' | 'write';
        }
    ];
    state: any;
    tags: {
        deviceInfo: string;
    };
    online: boolean;
    /** 第三方设备（已同步的设备）不存在这个字段 */
    protocol?: 'zigbee' | 'onvif' | 'rtsp' | 'esp32-cam';
}
