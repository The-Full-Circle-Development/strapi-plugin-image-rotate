import { PLUGIN_ID } from './pluginId';
import { Initializer } from './components/Initializer';
import { RotateDocumentAction } from './components/RotateDocumentAction';
import { RotatePreviewActions } from './components/RotatePreviewActions';
import { prefixPluginTranslations } from './utils/getTranslation';

export default {
  register(app) {
    // No menu link / standalone page on purpose: rotation lives where you edit
    // images, not in its own nav tab. See bootstrap() for the two surfaces.
    app.registerPlugin({
      id: PLUGIN_ID,
      initializer: Initializer,
      isReady: false,
      name: PLUGIN_ID,
    });
  },

  bootstrap(app) {
    // Surface 1 — Content Manager: a "Rotate images" document action that opens
    // a modal listing every image on the current entry. Self-hides when the
    // entry has no rotatable images (see RotateDocumentAction).
    const contentManager = app.getPlugin('content-manager');
    if (contentManager?.apis?.addDocumentAction) {
      contentManager.apis.addDocumentAction((actions) => [...actions, RotateDocumentAction]);
    }

    // Surface 2 — Media Library asset dialog (also reused by the CM media field).
    // @strapi/upload has no injection zone, so we publish the rotate control on a
    // global; a small patch to @strapi/upload's PreviewBox renders it next to Crop.
    if (typeof window !== 'undefined') {
      window.__strapiImageRotate = { PreviewActions: RotatePreviewActions };
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
