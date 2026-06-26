'use strict';

/**
 * Runs before bootstrap. Nothing to register at the moment — the rotate route is
 * protected by the existing `plugin::upload.assets.update` permission, so we don't
 * need to register a dedicated RBAC action.
 *
 * If you prefer a dedicated permission, register it here and reference it from
 * `routes/index.js`, e.g.:
 *
 *   await strapi.service('admin::permission').actionProvider.registerMany([
 *     { section: 'plugins', displayName: 'Rotate images', uid: 'rotate', pluginName: 'image-rotate' },
 *   ]);
 *   // -> action uid: `plugin::image-rotate.rotate`
 */
module.exports = ({ strapi }) => {};
