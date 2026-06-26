const PLUGIN_ID = 'image-rotate';

export default ({ strapi }) => ({
  /**
   * POST /image-rotate/rotate/:id
   * Body: { degrees?: number }  // multiple of 90, clockwise. Defaults to 90.
   */
  async rotate(ctx) {
    const { id } = ctx.params;
    const numericId = Number(id);
    if (!Number.isInteger(numericId) || numericId <= 0) {
      return ctx.badRequest('A valid numeric file `id` is required.');
    }

    const body = ctx.request.body ?? {};
    const degrees = body.degrees === undefined ? 90 : Number(body.degrees);
    if (!Number.isFinite(degrees) || degrees % 90 !== 0) {
      return ctx.badRequest('`degrees` must be a multiple of 90 (e.g. 90, -90, 180, 270).');
    }

    try {
      const file = await strapi.plugin(PLUGIN_ID).service('rotate').rotate(numericId, degrees);
      ctx.body = file;
    } catch (err) {
      // Service errors carry an HTTP status (RotateError). Surface their message;
      // anything else is an unexpected 500 (logged, message hidden).
      if (err && err.status) {
        return ctx.throw(err.status, err.message);
      }
      strapi.log.error(`[image-rotate] Unexpected error rotating file ${numericId}: ${err.stack || err.message}`);
      return ctx.throw(500, 'Failed to rotate the image.');
    }
  },
});
