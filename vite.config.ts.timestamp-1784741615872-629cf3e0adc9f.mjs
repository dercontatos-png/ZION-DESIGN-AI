// vite.config.ts
import tailwindcss from "file:///app/applet/node_modules/@tailwindcss/vite/dist/index.mjs";
import react from "file:///app/applet/node_modules/@vitejs/plugin-react/dist/index.js";
import path from "path";
import { defineConfig, loadEnv } from "file:///app/applet/node_modules/vite/dist/node/index.js";
var __vite_injected_original_dirname = "/app/applet";
var vite_config_default = defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  return {
    plugins: [react(), tailwindcss()],
    define: {
      "process.env.GEMINI_API_KEY": JSON.stringify(env.GEMINI_API_KEY),
      "process.env.API_KEY": JSON.stringify(env.API_KEY)
    },
    resolve: {
      alias: {
        "@": path.resolve(__vite_injected_original_dirname, "."),
        "formdata-polyfill/esm.min.js": path.resolve(__vite_injected_original_dirname, "src/mock-formdata.js"),
        "formdata-polyfill": path.resolve(__vite_injected_original_dirname, "src/mock-formdata.js")
      }
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== "true"
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvYXBwL2FwcGxldFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL2FwcC9hcHBsZXQvdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2FwcC9hcHBsZXQvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgdGFpbHdpbmRjc3MgZnJvbSAnQHRhaWx3aW5kY3NzL3ZpdGUnO1xuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0JztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHtkZWZpbmVDb25maWcsIGxvYWRFbnZ9IGZyb20gJ3ZpdGUnO1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHttb2RlfSkgPT4ge1xuICBjb25zdCBlbnYgPSBsb2FkRW52KG1vZGUsICcuJywgJycpO1xuICByZXR1cm4ge1xuICAgIHBsdWdpbnM6IFtyZWFjdCgpLCB0YWlsd2luZGNzcygpXSxcbiAgICBkZWZpbmU6IHtcbiAgICAgICdwcm9jZXNzLmVudi5HRU1JTklfQVBJX0tFWSc6IEpTT04uc3RyaW5naWZ5KGVudi5HRU1JTklfQVBJX0tFWSksXG4gICAgICAncHJvY2Vzcy5lbnYuQVBJX0tFWSc6IEpTT04uc3RyaW5naWZ5KGVudi5BUElfS0VZKSxcbiAgICB9LFxuICAgIHJlc29sdmU6IHtcbiAgICAgIGFsaWFzOiB7XG4gICAgICAgICdAJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4nKSxcbiAgICAgICAgJ2Zvcm1kYXRhLXBvbHlmaWxsL2VzbS5taW4uanMnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnc3JjL21vY2stZm9ybWRhdGEuanMnKSxcbiAgICAgICAgJ2Zvcm1kYXRhLXBvbHlmaWxsJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJ3NyYy9tb2NrLWZvcm1kYXRhLmpzJyksXG4gICAgICB9LFxuICAgIH0sXG4gICAgc2VydmVyOiB7XG4gICAgICAvLyBITVIgaXMgZGlzYWJsZWQgaW4gQUkgU3R1ZGlvIHZpYSBESVNBQkxFX0hNUiBlbnYgdmFyLlxuICAgICAgLy8gRG8gbm90IG1vZGlmeVx1MDBFMlx1MDA4MFx1MDA5NGZpbGUgd2F0Y2hpbmcgaXMgZGlzYWJsZWQgdG8gcHJldmVudCBmbGlja2VyaW5nIGR1cmluZyBhZ2VudCBlZGl0cy5cbiAgICAgIGhtcjogcHJvY2Vzcy5lbnYuRElTQUJMRV9ITVIgIT09ICd0cnVlJyxcbiAgICB9LFxuICB9O1xufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQW1OLE9BQU8saUJBQWlCO0FBQzNPLE9BQU8sV0FBVztBQUNsQixPQUFPLFVBQVU7QUFDakIsU0FBUSxjQUFjLGVBQWM7QUFIcEMsSUFBTSxtQ0FBbUM7QUFLekMsSUFBTyxzQkFBUSxhQUFhLENBQUMsRUFBQyxLQUFJLE1BQU07QUFDdEMsUUFBTSxNQUFNLFFBQVEsTUFBTSxLQUFLLEVBQUU7QUFDakMsU0FBTztBQUFBLElBQ0wsU0FBUyxDQUFDLE1BQU0sR0FBRyxZQUFZLENBQUM7QUFBQSxJQUNoQyxRQUFRO0FBQUEsTUFDTiw4QkFBOEIsS0FBSyxVQUFVLElBQUksY0FBYztBQUFBLE1BQy9ELHVCQUF1QixLQUFLLFVBQVUsSUFBSSxPQUFPO0FBQUEsSUFDbkQ7QUFBQSxJQUNBLFNBQVM7QUFBQSxNQUNQLE9BQU87QUFBQSxRQUNMLEtBQUssS0FBSyxRQUFRLGtDQUFXLEdBQUc7QUFBQSxRQUNoQyxnQ0FBZ0MsS0FBSyxRQUFRLGtDQUFXLHNCQUFzQjtBQUFBLFFBQzlFLHFCQUFxQixLQUFLLFFBQVEsa0NBQVcsc0JBQXNCO0FBQUEsTUFDckU7QUFBQSxJQUNGO0FBQUEsSUFDQSxRQUFRO0FBQUE7QUFBQTtBQUFBLE1BR04sS0FBSyxRQUFRLElBQUksZ0JBQWdCO0FBQUEsSUFDbkM7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
