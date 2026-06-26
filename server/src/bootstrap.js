'use strict';

module.exports = ({ strapi }) => {
  // Surface a clear warning if no upload provider can be resolved (extremely
  // unlikely, but it makes misconfiguration obvious instead of failing mid-rotate).
  if (!strapi.plugin('upload')?.provider) {
    strapi.log.warn(
      '[image-rotate] The upload plugin provider could not be resolved. Image rotation will fail until the Media Library / upload provider is configured.'
    );
  }
};
