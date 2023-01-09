import { createPinia } from 'pinia';
import { createPersistedState } from 'pinia-plugin-persistedstate';
import SecureLS from 'secure-ls';

const pinia = createPinia();
export const secureLS = new SecureLS();

// 数据持久化
pinia.use(
    createPersistedState({
        storage: {
            getItem: (key) => secureLS.get(key),
            setItem: (key, value) => secureLS.set(key, value)
        },
        // base64加密解密内容
        serializer: {
            serialize: JSON.stringify,
            deserialize: JSON.parse,
        },
    })
);

export default pinia;