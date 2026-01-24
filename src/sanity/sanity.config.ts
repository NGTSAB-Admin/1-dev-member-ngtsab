import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { createBrowserHistory } from 'history';
import { schemaTypes } from './schemaTypes';

const projectId = import.meta.env.VITE_SANITY_PROJECT_ID || 'xe995fko';
const dataset = import.meta.env.VITE_SANITY_DATASET || 'production';

// Create a stable history instance at module scope to prevent re-mount loops
const browserHistory = createBrowserHistory();

// Create a Sanity-compatible history adapter
const historyAdapter = {
  get location() {
    return browserHistory.location;
  },
  listen(listener: (location: { pathname: string; search: string }) => void) {
    return browserHistory.listen(({ location }) => listener(location));
  },
  push(path: string) {
    browserHistory.push(path);
  },
  replace(path: string) {
    browserHistory.replace(path);
  },
};

export const config = defineConfig({
  name: 'ngtsab-blog',
  title: 'NGTSAB Blog',
  projectId,
  dataset,
  basePath: '/admin/blog',
  plugins: [
    structureTool(),
    visionTool(),
  ],
  schema: {
    types: schemaTypes,
  },
  history: historyAdapter,
});
