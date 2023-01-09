# 项目必读

## 前端

## 后端

### 持久化存储

# AddOn 后端接口

## 1、AddOn 前端接口

开放给 addon 前端调用接口

### 基础参数

调用任何接口都要携带基础参数， 参数位置由请求方法决定。
GET 请求则放在 params，非 GET 请求放在 body

| 参数名  | 参数类型 | 参数描述     |
| ------- | -------- | ------------ |
| `appid` | `string` | 应用 ID      |
| `ts`    | `string` | 请求的时间戳 |

### 签名计算

```ts
// 颁发给调用方的 appId
const APP_ID = 'xxx';
// 颁发给调用方的 appSecret
const APP_SECRET = 'yyy';

// 调用参数 params
const params = {
    appId: APP_ID,
    ts: '1668513734464',
    otherParams: 'zzz',
};

// 排序并序列化
let signStr = '';
Object.keys(payload)
    .sort()
    .forEach((key) => {
        const value = _.get(payload, key);
        signStr += `${key}${typeof value === 'object' ? JSON.stringify(value) : value}`;
    });

// 计算sign
signStr = MD5(`${appSecret}${encodeURIComponent(signStr)}${appSecret}`)
    .toString()
    .toUpperCase();
```

> 前端签名从 `headers["sign"]` 中获取，并且格式必须为 `Sign [your sign]`

### 鉴权校验

除了`user`相关子路由以及`/device/lan`接口以外，其余接口均需要 at 鉴权才能调用

> 前端 at 从 `headers["authorization"]` 中获取，并且格式必须为 `Bearer [your at]`

### 返回值说明

JSON 格式

```json
{
    "error": 888,
    "msg": "hello, world",
    "data": {
        "foo": "bar"
    }
}
```

-   `error` - 错误码

-   `msg` - 错误码对应的错误提示

-   `data` - 返回数据

### 错误码说明

| 错误码 | 描述               |
| ------ | ------------------ |
| `0`    | 成功               |
| `400`  | 参数错误           |
| `404`  | 不存在             |
| `401`  | 鉴权错误或 at 失效 |
| 1001   | 登录密码错误       |
| 1002   | 帐号格式有误       |

｜ 1003 ｜用户不存在 ｜
｜ 1004 ｜账号或密码错误 ｜
| 1100 | 没有 ihost 凭证 |

### 接口说明

#### 获取登录状态

-   方法：`GET`
-   路径：`/user/status`
-   返回值：

| 参数名      | 参数类型  | 是否必填 | 参数说明    |
| :---------- | --------- | -------- | ----------- |
| loginStatus | `boolean` | 是       | 是否已登录  |
| userInfo    | `userObj` | 否       | 用户信息    |
| at          | string    | 否       | accessToken |

`userObj`

| 参数名         | 参数类型  | 是否必填 | 参数说明       |
| -------------- | --------- | -------- | -------------- |
| account        | `string`  | 否       | 电话号码或邮箱 |
| autoSyncStatus | `boolean` | 否       | 是否自动同步   |

#### 获取所有局域网设备（登录前）

-   方法：`GET`

-   路径：`/device/lan`

-   参数：无

-   返回值：`data`

| 参数名     | 参数类型       | 是否必填 | 参数说明           |
| ---------- | -------------- | -------- | ------------------ |
| deviceList | `deviceItem[]` | 是       | 局域网设备数据列表 |

`deviceItem[]`

| 参数名   | 参数类型 | 是否必填 | 参数说明                  |
| -------- | -------- | -------- | ------------------------- |
| deviceId | `string` | 是       | 设备 id                   |
| category | string   | 是       | plug 单通道，strip 多通道 |

#### 账号登录

-   方法：`POST`

-   路径：`/user/{account}/account`

    account 账号（手机或邮箱）

-   参数：

| 参数名      | 参数类型 | 是否必填 | 参数说明                             |
| :---------- | -------- | -------- | ------------------------------------ |
| countryCode | `string` | 是       | 国家码区号，必须以"+"开头，比如"+86" |
| password    | `string` | 是       | 密码                                 |

-   返回值： `data`

| 参数名   | 参数类型  | 是否必填 | 参数说明    |
| -------- | --------- | -------- | ----------- |
| userInfo | `userObj` | 是       | 用户信息    |
| at       | `string`  | 是       | accessToken |

`userObj`

| 参数名         | 参数类型  | 是否必填 | 参数说明           |
| -------------- | --------- | -------- | ------------------ |
| account        | `string`  | 否       | 电话号码或用户邮箱 |
| autoSyncStatus | `boolean` | 是       | 是否开启自动同步   |

#### 获取通过二维码登录添加 key（暂不开发）

-   方法：`GET`

-   路径：`/user/qr-code`

-   参数：无

-   返回值： `data`

| 参数名     | 参数类型 | 是否必填 | 参数说明                  |
| ---------- | -------- | -------- | ------------------------- |
| key        | `string` | 是       | 二维码 key 用于生成二维码 |
| expireTime | `string` | 是       | 过期时间                  |

#### 获取二维码状态 （前端轮询）（暂不开发）

-   方法：`GET`

-   路径：`/user/{code}/qr-code`

    code 二维码的 key

-   参数：无

-   返回值：`data`

| 参数名 | 参数类型   | 是否必填 | 参数说明                                                                   |
| ------ | ---------- | -------- | -------------------------------------------------------------------------- |
| status | `string`   | 是       | 二维码登录状态<br/>0: 成功<br/>1: 未扫码<br/>2: 登录失败<br/>3: 二维码超时 |
| user   | `userInfo` | 否       | 用户凭证等信息，仅在**二维码登陆状态为 0**时返回                           |

`userInfo`

| 参数名   | 参数类型  | 是否必填 | 参数说明 |
| -------- | --------- | -------- | -------- |
| at       | `string`  | 是       | 凭证     |
| userInfo | `userObj` | 是       | 用户信息 |

`userObj`

| 参数名      | 参数类型 | 是否必填 | 参数说明 |
| ----------- | -------- | -------- | -------- |
| phoneNumber | `string` | 否       | 电话号码 |
| email       | `string` | 否       | 用户邮箱 |

#### 获取所有的局域网设备（登录后）

-   方法：`GET`

-   路径：`/device`

-   返回值： `data`

| 参数名 | 参数类型       | 是否必填 | 参数说明   |
| ------ | -------------- | -------- | ---------- |
| data   | `deviceItem[]` | 是       | 子设备数组 |

`deviceItem`

| 参数名          |           | 是否必填 | 参数说明                                                                    |
| --------------- | --------- | -------- | --------------------------------------------------------------------------- |
| deviceId        | `string`  | 否       | 设备唯一 id                                                                 |
| deviceName      | `string`  | 是       | 设备名称, 未改名时由前端根据默认显示规则进行展示。                          |
| displayCategory | `string`  | 是       | 对应的图标类型,开关插座--switch,无线开关--button,风扇灯--fanLight,灯--light |
| familyName      | `string`  | 是       | 家庭名称                                                                    |
| isSynced        | `boolean` | 是       | 是否已同步                                                                  |
| isOnline        | `boolean` | 是       | 是否在线                                                                    |
| isMyAccount     | boolean   | 是       | 是否在我的账号下                                                            |
| isSupported     | boolean   | 是       | 是否支持同步到 ihost                                                        |

#### 获取 iHost 网关凭证

-   方法：`GET`

-   路径：`/user/access-token`

-   返回值： error: 0

#### 同步单个设备

-   方法：`POST`

-   路径：`/device/{deviceId}/sync`

-   返回值： error: 0

#### 自动同步所有设备

-   方法：`POST`

-   路径：`/device/sync`

-   返回值： error: 0

#### 取消同步单个设备

-   方法：`DELETE`

-   路径：`/device/{deviceId}`

-   返回值： error: 0

#### 取消同步所有设备

-   方法：`DELETE`
-   路径：`/device`
-   返回值： error: 0

#### 更改是否自动同步

-   方法：`PUT`
-   路径：`/device`/sync-status
-   参数：

| 参数名         | 参数类型  | 是否必填 | 参数说明         |
| :------------- | --------- | -------- | ---------------- |
| autoSyncStatus | `boolean` | 是       | 是否开启自动同步 |

-   返回值： error: 0

#### 退出登录

-   方法：`PUT`
-   路径：`/user`
-   返回值：error: 0
