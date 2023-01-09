
import type { App } from "vue";
import {
    LeftOutlined,
    CloseOutlined
} from "@ant-design/icons-vue";

const antIcons = {
    LeftOutlined,
    CloseOutlined

}

export default function SetupAntdIcon(app: App<Element>): void {
    // 注册组件
    Object.keys(antIcons).forEach((key) => {
        app.component(key, antIcons[key as keyof typeof antIcons]);
    });
}