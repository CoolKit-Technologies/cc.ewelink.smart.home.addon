import { fileURLToPath, URL } from 'node:url'
import AutoImport from 'unplugin-auto-import/vite'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    AutoImport({ 
    	/* options */
    	// 这是vue3的配置
		imports:['vue'],
    	dts:"src/auto-import.d.ts" // 生成在src路径下名为auto-import.d.ts的声明文件
	 }),

  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      /* 解决i18n控制台warning */
      'vue-i18n': 'vue-i18n/dist/vue-i18n.cjs.js',
    }
  }
})
