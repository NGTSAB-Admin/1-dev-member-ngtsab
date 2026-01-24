import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { createBrowserHistory } from 'history';
import { schemaTypes } from './schemaTypes';

const projectId = import.meta.env.VITE_SANITY_PROJECT_ID || 'xe995fko';
const dataset = import.meta.env.VITE_SANITY_DATASET || 'production';

export const config = defineConfig({
  name: 'ngtsab-blog',
  title: 'NGTSAB Blog',
  projectId,
  dataset,
  basePath: '/admin/blog',
  // Provide a concrete history instance to avoid "history is undefined" crashes
  // inside Sanity's workspace matcher when embedded in other SPAs.
  unstable_history: createBrowserHistory(),
  plugins: [
    structureTool(),
    visionTool(),
  ],
  schema: {
    types: schemaTypes,
  },
});
