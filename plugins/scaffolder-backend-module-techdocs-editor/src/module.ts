import { coreServices, createBackendModule } from '@backstage/backend-plugin-api';
import { DefaultGithubCredentialsProvider, ScmIntegrations } from '@backstage/integration';
import { scaffolderActionsExtensionPoint } from '@backstage/plugin-scaffolder-node';
import { createTechdocsEditorSetupAction } from './setupAction';

/** Registra `techdocs-editor:setup` no Scaffolder, com as credenciais das integrações do GitHub. */
export const scaffolderModuleTechdocsEditor = createBackendModule({
  pluginId: 'scaffolder',
  moduleId: 'techdocs-editor',
  register({ registerInit }) {
    registerInit({
      deps: { scaffolder: scaffolderActionsExtensionPoint, config: coreServices.rootConfig },
      async init({ scaffolder, config }) {
        const integrations = ScmIntegrations.fromConfig(config);
        scaffolder.addActions(
          createTechdocsEditorSetupAction({
            integrations,
            credentialsProvider: DefaultGithubCredentialsProvider.fromIntegrations(integrations),
          }),
        );
      },
    });
  },
});
