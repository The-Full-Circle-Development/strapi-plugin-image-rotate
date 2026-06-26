'use strict';

/**
 * Admin routes are mounted under `/<plugin-id>` (i.e. `/image-rotate/...`) in the
 * admin namespace and are only reachable from the authenticated admin panel.
 *
 * Protection:
 *   - `admin::isAuthenticatedAdmin` requires a logged-in admin user.
 *   - `admin::hasPermissions` on `plugin::upload.assets.update` means "anyone who is
 *     already allowed to edit Media Library assets can rotate" — no extra RBAC setup
 *     is needed, and Super Admins always pass. Remove that entry to allow any
 *     authenticated admin, or swap it for a dedicated `plugin::image-rotate.*` action.
 */
module.exports = {
  admin: {
    type: 'admin',
    routes: [
      {
        method: 'POST',
        path: '/rotate/:id',
        handler: 'rotate.rotate',
        config: {
          policies: [
            'admin::isAuthenticatedAdmin',
            {
              name: 'admin::hasPermissions',
              config: { actions: ['plugin::upload.assets.update'] },
            },
          ],
        },
      },
    ],
  },
};
