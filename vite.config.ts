import {defineConfig} from 'vite';
import path, {resolve} from "node:path";
import dts from 'vite-plugin-dts'

import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';



export default defineConfig({
    plugins: [vue(), dts(), tailwindcss()],
    build: {
        lib: {
            entry: resolve(__dirname, "src/index.ts"),
            name: "Vue3Otp",
            formats: ["es", "cjs", "umd"],
            fileName: (format) => `vue3-otp.${format}.js`
        },
        rollupOptions: {
            external: ["vue"],
            output: {
                globals: {
                    vue: "Vue",
                },
            },
        },
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "src"),
        },
    }
});
