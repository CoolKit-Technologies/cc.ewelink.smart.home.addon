# eWeLink Smart Home

## What is eWeLink Smart Home

eWeLink Smart Home can discover eWeLink WiFi devices in LAN. After login with eWeLink account, you can sync the device you chose to eWeLink CUBE. By eWeLink CUBE, you can control the device in LAN and link the zigbee device in eWeLink CUBE with the scene.

## Quick start

1. generate the appid, appSecret required for front and back-end communication

-   server side

**server/config/prod.ts**

```javascript
export const prodConf = {
    ...
    auth: {
        appId: '16-letter-or-number-combination',
        appSecret: '32-letter-or-number-combination',
    }
    ...
}
```

-   web frontend

**web/config.ts**

```javascript
const PROD_APPID = 'prodConf.auth.appId string';
const PROD_SECRET = 'prodConf.auth.secret string';
```

2. Generate eWeLink AppId and Secret by logging into [eWeLink Developer Platform](https://dev.ewelink.cc/) with your eWeLink account

Place the generated AppId and Secret in the following file

**server/config/prod.ts**

```javascript
export const prodConf = {
    ...
    coolKit: {
        appId: '16-letter-or-number-combination',
        appSecret: '32-letter-or-number-combination',
    }
    ...
}
```

3. Package the project

Executes the build script in terminal , which is used to pack the frontend and back-end code which generates a zip file named `deploy.tar.gz`.

```shell
sh bin/build.sh
```

4. Build and upload the image

-   4.1 Upload the `deploy.tar.gz` file to a Linux host with `linux/arm/v7` architecture
-   4.2 Unzip the `deploy.tar.gz` file
-   4.3 Go to the **deploy** directory and execute `sh push.sh` in the terminal
-   4.4 After building the image, you need to enter the docker hub account and password in the terminal to upload the image

5. Install and run the image

-   5.1 Open the `eWeLink CUBE` docker configuration page
-   5.2 Search for the above uploaded image name
-   5.3 After successful installation and run it with the corresponding parameters, you can use it on `eWeLink CUBE`.
