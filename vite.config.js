import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";
import basicSsl from "@vitejs/plugin-basic-ssl";
import svgr from "vite-plugin-svgr";

export default defineConfig({
    plugins: [react(), basicSsl(), svgr()],
    optimizeDeps: {
        rolldownOptions: {
            output: {
                strictExecutionOrder: true,
            },
        },
    },
    server: {
        host: true,
        https: process.env.HTTPS === "true",
        port: Number(process.env.PORT) || 61234,
    },
    build: {
        outDir: "build",
        rolldownOptions: {
            output: {
                strictExecutionOrder: true,
                codeSplitting: {
                    groups: [
                        {
                            name: "world-map-data",
                            test: /globe\.geo\.json$/,
                            priority: 20,
                        },
                        {
                            name: "vendor",
                            test: /node_modules/,
                            maxSize: 450000,
                        },
                    ],
                },
            },
        },
    },
});
