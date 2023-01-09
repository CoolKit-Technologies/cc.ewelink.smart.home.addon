//内存中保存已经接收到的请求的时间

class controlRequestMapClass {
    public requestMap: Map<string, number>;
    constructor() {
        this.requestMap = new Map();
    }
}
export default new controlRequestMapClass();
