<template>
    <Header />
    <Content />
</template>

<script setup lang="ts">
import Header from '@/views/Home/components/Header.vue';
import Content from '@/views/Home/components/Content.vue';
import { useEtcStore } from '@/store/etc';
import api from '@/api';
import { useDeviceStore } from '@/store/device';
const etcStore = useEtcStore();
const deviceStore = useDeviceStore();

onMounted(async () => {
    console.log('浏览器语言为：', navigator.language);
    const browserLanguage = navigator.language;
    if (browserLanguage.includes('zh')) {
        // etcStore.languageChange('en-us');
        etcStore.languageChange('zh-cn');
    } else {
        etcStore.languageChange('en-us');
    }
    await getUserInfo();
    getDeviceListInfo()
    setInterval(async () => getUserInfo(), 10000);
});

const getUserInfo = async () => {
    const res = await api.smartHome.getLoginStatus();
    if (res.data && res.error === 0) {
        if (res.data.loginStatus) {
            const etcStore = useEtcStore();
            const deviceStore = useDeviceStore();
            etcStore.setUserInfo(res.data.userInfo);
            etcStore.setAt(res.data.at);
            etcStore.setLoginState(true);
            deviceStore.getAfterLoginDeviceList();
            if (deviceStore.beforeLoginDeviceListInterval !== 0) {
                clearInterval(deviceStore.beforeLoginDeviceListInterval);
            }
            if (deviceStore.afterLoginDeviceListInterval === 0) {
                const afterInterval = setInterval(() => {
                    deviceStore.getAfterLoginDeviceList();
                }, 10000);
                deviceStore.setAfterLoginDeviceListInterval(afterInterval);
            }
        }
    }
};



const getDeviceListInfo = ()=>{
    if (etcStore.isLogin) {
        deviceStore.getAfterLoginDeviceList();
        const afterInterval = setInterval(() => {
            deviceStore.getAfterLoginDeviceList();
        }, 10000);
        deviceStore.setAfterLoginDeviceListInterval(afterInterval);
        // api.setEventCallback(errorCallback);
    } else {
        deviceStore.getBeforeLoginDeviceList();
        const beforeInterval = setInterval(() => {
            deviceStore.getBeforeLoginDeviceList();
        }, 10000);
        deviceStore.setBeforeLoginDeviceListInterval(beforeInterval);
    }
}
</script>

<style scoped lang="scss"></style>
