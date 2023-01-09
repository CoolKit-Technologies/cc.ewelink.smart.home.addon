import { createApp } from 'vue'
import pinia from '@/store'
import 'ant-design-vue/dist/antd.css';
import App from './App.vue'
import router from './router'
import i18n from '@/i18n';
import Events from 'events';

import { message } from 'ant-design-vue';
import '@/assets/style/index.scss';
import './assets/main.css'
import AntdImport from '@/utils/AntdImport';
import SetupAntdIcon from "@/utils/AntdIcons";
const app = createApp(App)
/** antd消息提示最多一条 */
message.config({
    maxCount: 1,
});
// 注册监听事件
export const emitter = new Events.EventEmitter();
app.use(pinia)
app.use(router)
app.use(i18n)
AntdImport(app);
SetupAntdIcon(app);
app.mount('#app')
