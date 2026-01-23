import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { schemaTypes } from './schemas';

const projectId = 'xe995fko';
const dataset = 'production';

export default defineConfig({
  name: 'default',
  title: 'Blog Studio',
  projectId,
  dataset,
  plugins: [structureTool()],
  schema: {
    types: schemaTypes,
  },
  basePath: '/admin/blog',
});
