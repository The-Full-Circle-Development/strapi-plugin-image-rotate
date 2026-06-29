import { RotatePreviewActions } from './components/RotatePreviewActions';
import { prefixPluginTranslations } from './utils/getTranslation';

export default {
  // No menu link, no standalone page, and no Content Manager document action on
  // purpose: rotation lives where you edit an image — next to Crop in the asset
  // dialog. `register` must stay a function (Strapi's StrapiApp calls it
  // unguarded), but a pure-injection plugin has nothing to register.
  register() {},

  bootstrap() {
    // @strapi/upload exposes no admin injection zone, so we publish the rotate
    // control on a global; a small patch to @strapi/upload's PreviewBox renders
    // it next to Crop (see the cms `patches/` dir). The same PreviewBox dialog is
    // reused by BOTH the Media Library and the Content Manager media field, so
    // this single injection covers both surfaces.
    if (typeof window !== 'undefined') {
      window.__strapiImageRotate = {
        ...(window.__strapiImageRotate || {}),
        PreviewActions: RotatePreviewActions,
      };
    }
  },

  async registerTrads({ locales }) {
    return Promise.all(
      locales.map(async (locale) => {
        try {
          const { default: data } = await import(`./translations/${locale}.json`);
          return { data: prefixPluginTranslations(data), locale };
        } catch {
          return { data: {}, locale };
        }
      })
    );
  },
};
