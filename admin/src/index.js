import { PLUGIN_ID } from './pluginId';
import { Initializer } from './components/Initializer';
import { PluginIcon } from './components/icons';
import { RotateDocumentAction } from './components/RotateDocumentAction';
import { prefixPluginTranslations } from './utils/getTranslation';

export default {
  register(app) {
    // Standalone admin page — the supported alternative to the (non-extensible)
    // Media Library edit dialog. Lets users browse + rotate any uploaded image.
    app.addMenuLink({
      to: `plugins/${PLUGIN_ID}`,
      icon: PluginIcon,
      intlLabel: {
        id: `${PLUGIN_ID}.plugin.name`,
        defaultMessage: 'Image Rotate',
      },
      Component: () => import('./pages/App'),
      permissions: [],
    });

    app.registerPlugin({
      id: PLUGIN_ID,
      initializer: Initializer,
      isReady: false,
      name: PLUGIN_ID,
    });
  },

  bootstrap(app) {
    // Add a "Rotate images" action to the Content Manager edit view. The action
    // self-hides on entries with no rotatable images (see RotateDocumentAction).
    const contentManager = app.getPlugin('content-manager');
    if (contentManager?.apis?.addDocumentAction) {
      contentManager.apis.addDocumentAction((actions) => [...actions, RotateDocumentAction]);
    }
  },

  async registerTrads({ locales }) {
    return Promise.all(
      locales.map(async (locale) => {
        try {
          const { default: data } = await import(`./translations/${locale}.json`);
          return { data: prefixPluginTranslations(data, PLUGIN_ID), locale };
        } catch {
          return { data: {}, locale };
        }
      })
    );
  },
};
