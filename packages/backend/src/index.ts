import { createBackend } from '@backstage/backend-defaults';

// Development backend: the minimum the editor needs (catalog, TechDocs, sign-in) plus the
// techdocs-editor:setup scaffolder action
const backend = createBackend();

backend.add(import('@backstage/plugin-app-backend'));
backend.add(import('@backstage/plugin-proxy-backend'));
backend.add(import('@backstage/plugin-auth-backend'));
backend.add(import('@backstage/plugin-auth-backend-module-guest-provider'));
backend.add(import('@backstage/plugin-auth-backend-module-github-provider'));
backend.add(import('@backstage/plugin-catalog-backend'));
backend.add(import('@backstage/plugin-permission-backend'));
backend.add(import('@backstage/plugin-permission-backend-module-allow-all-policy'));
backend.add(import('@backstage/plugin-techdocs-backend'));
// The TechDocs reader has a search box (in-memory engine)
backend.add(import('@backstage/plugin-search-backend'));
backend.add(import('@backstage/plugin-search-backend-module-techdocs'));
backend.add(import('@backstage/plugin-scaffolder-backend'));
backend.add(import('@edtroleis/plugin-scaffolder-backend-module-techdocs-editor'));

backend.start();
