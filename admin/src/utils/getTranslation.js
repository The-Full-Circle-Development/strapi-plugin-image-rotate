import { PLUGIN_ID } from '../pluginId';

/**
 * Namespaces a translation key under the plugin id, e.g.
 * getTranslation('action.rotateRight') -> 'image-rotate.action.rotateRight'
 */
export const getTranslation = (id) => `${PLUGIN_ID}.${id}`;

/**
 * Prefixes every key of a flat translation object with the plugin id.
 * (Replaces `prefixPluginTranslations` from the removed v4 `@strapi/helper-plugin`.)
 */
export const prefixPluginTranslations = (translations, pluginId = PLUGIN_ID) =>
  Object.keys(translations).reduce((acc, key) => {
    acc[`${pluginId}.${key}`] = translations[key];
    return acc;
  }, {});
