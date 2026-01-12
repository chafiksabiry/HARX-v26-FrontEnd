import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import * as cheerio from 'cheerio';

const htmlRemoveFreshPlugin = () => {
  return {
    name: 'html-transform',
    transformIndexHtml(html: any) {
      const $ = cheerio.load(html);
      $('script').eq(0).remove();  // Remove the problematic script tag (React refresh)
      html = $.html();
      return html;
    },
  };
};

export default defineConfig(({ mode }) => {
  const isDev = mode === 'development';

  return {
    plugins: [
      react({
        jsxRuntime: 'automatic',
      }
      ), // React plugin
      ...(isDev ? [htmlRemoveFreshPlugin()] : []),  // Only remove in production
    ],
    server: {
      port: 3000,
      cors: false,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
      proxy: {
        '/app1': {
          target: 'https://registration.harx.ai',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/app1/, ''),
        },
        '/app2': {
          target: 'https://choicepage.harx.ai/',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/app2/, ''),
        },
        /*         '/app3': {
                  target: 'https://repcreationwizard.harx.ai',
                  changeOrigin: true,
                  rewrite: (path) => path.replace(/^\/app3/, ''),
                }, */
        '/repcreationprofile/*': {
          target: 'https://rep-profile-creation.harx.ai/',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/repcreationprofile/, ''),
        },
        '/repassessments/*': {
          target: 'https://rep-assessments.harx.ai/',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/repassessments/, ''),
        },
        '/repdashboard/*': {
          target: 'https://rep-dashboard.harx.ai/',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/repdashboard/, ''),
        },
        '/reporchestrator/*': {
          target: 'https://rep-orchestrator.harx.ai/',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/reporchestrator/, ''),
        },
        '/app4': {
          target: 'https://companysearchwizard.harx.ai',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/app4/, ''),
        },
        '/app5': {
          target: 'https://gigsmanual.harx.ai',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/app5/, ''),
        },
        '/app6': {
          target: 'https://gigsai.harx.ai',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/app6/, ''),
        },
        '/app7': {
          target: 'https://dashboard.harx.ai',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/app7/, ''),
        },
        '/app11': {
          target: 'https://comp-orchestrator.harx.ai',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/app11/, ''),
        },
        '/app12': {
          target: 'https://matching.harx.ai',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/app12/, ''),
        },

        '/knowledgebase/*': {
          target: 'https://knowledge-base.harx.ai/',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/knowledgebase/, ''),
        },
        '/copilot': {
          target: 'https://copilot.harx.ai/',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/copilot/, ''),
        },
        '/training/*': {
          target: 'https://training.harx.ai/',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/training/, ''),
        },
/*         '/repdashboard/profile': {
          target: 'https://rep-dashboard.harx.ai/profile',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/repdashboard\/profile/, ''),
        }, */
      },
    },
    optimizeDeps: {
      include: ['react', 'react-dom'], // Pre-bundle react and react-dom to ensure smooth behavior
    },
  };
});
