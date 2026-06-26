# 🔄 strapi-plugin-image-rotate

> Rotate Media Library images **90° in place** for **Strapi v5** — from the Content Manager and a dedicated admin page — **without** Strapi's flaky `replace` flow.

Rotating an image normally means re-uploading it through Strapi's `replace`, which **deletes the original first and then re-uploads** (in older v5 builds). On caches, async thumbnail generation, and cloud providers (S3 / Cloudinary) that leaves a window where the asset 404s and, if the re-upload fails, the original is gone.

This plugin takes a more surgical approach:

1. **Fetch** the current file bytes (provider-agnostic).
2. **Rotate** with `sharp` (EXIF-orientation aware, lossless 90° turns).
3. **Overwrite the exact same storage key** (same `hash` + `ext`) via the **active upload provider** — the original is only ever replaced atomically, and the **public URL stays stable** on local & S3.
4. **Regenerate** the thumbnail + responsive formats from the rotated bytes.
5. **Clean up** any now-orphaned formats and **update** the file record (`width` / `height` / `size` / `formats` / `url`).

---

## ✨ Features

- Rotate left/right by 90° (and 180°/270° via the API) for JPEG, PNG, WebP, TIFF, AVIF, HEIF.
- **No URL change** on the local and S3 providers — existing references keep working.
- Regenerates `thumbnail`, `small`, `medium`, `large` formats so the Media Library stays consistent.
- **EXIF-safe**: phone-photo orientation is baked in before rotating and stripped after, so browsers never double-rotate.
- Two entry points in the admin panel:
  - A **"Rotate images"** action in the **Content Manager** edit view (appears only when the entry has images).
  - A standalone **Image Rotate** page that browses the Media Library and rotates any asset.
- Secured by the existing `plugin::upload.assets.update` permission — no extra RBAC setup.
- Pure JavaScript, built with the official `@strapi/sdk-plugin`.

---

## 📋 Requirements

| | |
|---|---|
| Strapi | `^5.0.0` |
| Node | `>=18` |
| `sharp` | provided by Strapi v5 at runtime (declared as a peer dependency) |

---

## 📦 Installation

```bash
# npm
npm install strapi-plugin-image-rotate

# yarn
yarn add strapi-plugin-image-rotate

# pnpm
pnpm add strapi-plugin-image-rotate
```

Strapi auto-discovers installed plugins (via the `strapi.kind: "plugin"` key in `package.json`), so **no `config/plugins` entry is required**. To configure or explicitly enable it:

```js
// config/plugins.js
module.exports = ({ env }) => ({
  'image-rotate': true,
});
```

Then rebuild the admin and start:

```bash
npm run build && npm run develop
```

> **Using it as a local (un-published) plugin?** Build it first (`npm run build` inside the plugin folder — the admin part **must** be transpiled), then point Strapi at it:
> ```js
> // config/plugins.js
> 'image-rotate': { enabled: true, resolve: './src/plugins/strapi-plugin-image-rotate' }
> ```

---

## 🚀 Usage

### 1. Content Manager edit view

Open any entry that contains a media (image) field. A **Rotate images** action appears in the edit-view panel. It opens a modal listing every image on the entry with rotate-left / rotate-right buttons. Thumbnails refresh in place after each rotation.

> The action automatically hides on the create view and on entries with no rotatable images.

### 2. Dedicated "Image Rotate" page

A new **Image Rotate** link appears in the main navigation. It lists images straight from the Media Library (`GET /upload/files`) and lets you rotate any of them. This is the plugin's **Media-Library workflow** (see the design note below for why it isn't injected directly into the Media Library dialog).

### 3. HTTP API

```http
POST /image-rotate/rotate/:id
Content-Type: application/json

{ "degrees": 90 }   // multiple of 90, clockwise. -90 = counter-clockwise. Defaults to 90.
```

This is an **admin route** — call it from the authenticated admin panel (the plugin uses `useFetchClient` from `@strapi/strapi/admin`, which attaches the admin JWT automatically).

---

## 🧩 How it works (server)

All of the heavy lifting lives in [`server/src/services/rotate.js`](./server/src/services/rotate.js) and deliberately mirrors Strapi's own internal `replaceImage` helper, minus the parts that cause trouble:

```js
const dbFile = await strapi.db.query('plugin::upload.file').findOne({ where: { id } });

// 1. read original bytes (fetch for cloud URLs, disk for the local provider)
const buffer = await getOriginalBuffer(dbFile);

// 2. rotate with sharp (auto-orient -> rotate -> strip EXIF, re-encode same format)
const rotated = await rotateBuffer(buffer, 90);

// 3. reuse the SAME hash + ext so the provider overwrites the same key/URL
const fileData = { ...dbFile, getStream: () => Readable.from(rotated), formats: {} };
const { width, height } = await imageManipulation.getDimensions(fileData);

// 4. regenerate formats, then overwrite the main asset in place
await provider.upload(thumbnail); await provider.upload(...responsive);
await provider.upload(fileData);

// 5. delete orphaned formats + persist new geometry
await strapi.db.query('plugin::upload.file').update({ where: { id }, data: { width, height, size, formats, url } });
```

Key implementation choices, verified against the Strapi v5 upload source:

- The upload **provider** is reached via `strapi.plugin('upload').provider` (raw) and `strapi.plugin('upload').service('provider')` (the wrapper that picks stream-vs-buffer and cleans up temp files).
- **Thumbnails/formats** are regenerated with the core `image-manipulation` service (`getDimensions`, `generateThumbnail`, `generateResponsiveFormats`) — so output matches what Strapi itself produces.
- The DB record is written with `strapi.db.query('plugin::upload.file').update(...)` (not the Document Service), exactly like the core upload service.

---

## 🗂️ Provider compatibility

| Provider | In-place overwrite | URL stable? | Notes |
|---|---|---|---|
| **Local** (`@strapi/provider-upload-local`) | ✅ | ✅ | Overwrites `public/uploads/<hash><ext>`. |
| **AWS S3** (`@strapi/provider-upload-aws-s3`) | ✅ | ✅ | `PutObject` on the same key. Add `?v=` cache-busting (the plugin does this in the UI) if a CDN sits in front. |
| **Cloudinary** (`@strapi/provider-upload-cloudinary`) | ✅ | ⚠️ **changes** | Cloudinary's `secure_url` contains a `/v<timestamp>/` segment that changes on every overwrite, so the stored `url` changes. The plugin updates the DB record accordingly, but any **externally hard-coded** old URL will need refreshing. CDN invalidation can take seconds–minutes to propagate. |

For private buckets where the file URL isn't publicly fetchable, the original-bytes download step may fail — open an issue if you need a signed-download path.

---

## 🔐 Permissions

The rotate route is protected with:

```js
config: {
  policies: [
    'admin::isAuthenticatedAdmin',
    { name: 'admin::hasPermissions', config: { actions: ['plugin::upload.assets.update'] } },
  ],
}
```

So **anyone who can already edit Media Library assets can rotate** — Super Admins always pass, and no new permission needs to be granted. To use a dedicated permission instead, register an action in [`server/src/register.js`](./server/src/register.js) and reference its uid in [`server/src/routes/index.js`](./server/src/routes/index.js).

---

## 🧱 Repository structure

```
strapi-plugin-image-rotate/
├── package.json              # exports ./strapi-server & ./strapi-admin (the v5 equivalent of
│                             #   the old strapi-server.js / strapi-admin.js entry files)
├── admin/
│   ├── jsconfig.json
│   └── src/
│       ├── index.js              # register() menu link + bootstrap() document action + registerTrads()
│       ├── pluginId.js
│       ├── components/
│       │   ├── Initializer.jsx
│       │   ├── icons.jsx             # inline SVGs (no @strapi/icons name coupling)
│       │   ├── RotateActions.jsx     # the two rotate buttons + API call (reused everywhere)
│       │   ├── RotateModal.jsx       # modal body listing an entry's images
│       │   └── RotateDocumentAction.jsx  # Content Manager edit-view action
│       ├── pages/
│       │   ├── App.jsx
│       │   └── HomePage.jsx          # standalone "Image Rotate" page
│       ├── utils/
│       │   ├── collectImages.js
│       │   └── getTranslation.js
│       └── translations/{en,fr}.json
└── server/
    └── src/
        ├── index.js              # exports register/bootstrap/config/controllers/routes/services
        ├── register.js
        ├── bootstrap.js
        ├── config/index.js
        ├── controllers/{index,rotate}.js
        ├── routes/index.js
        └── services/{index,rotate}.js   # ← the rotation engine
```

> **About `strapi-server.js` / `strapi-admin.js`:** Strapi v5 plugins built with `@strapi/sdk-plugin` no longer use root `strapi-server.js` / `strapi-admin.js` files. Their role is filled by the `exports["./strapi-server"]` and `exports["./strapi-admin"]` keys in `package.json`, which point to `server/src/index.js` and `admin/src/index.js` (source) and `dist/**` (built output). That mapping **is** the modern `strapi-server` / `strapi-admin` configuration.

---

## 🛠️ Local development

```bash
# install deps
npm install

# build once
npm run build

# verify the package is a valid, publishable Strapi plugin
npm run verify

# live-rebuild against a host Strapi app (yalc link)
npm run watch:link
```

To publish:

```bash
npm run build   # also runs automatically via prepublishOnly
npm publish
```

(Only `dist/` is published — see the `files` field.)

---

## 🧭 Design note — why not a button inside the Media Library "Edit Asset" dialog?

The original goal was a rotate button right inside the Media Library's edit-asset modal. **Strapi v5's Upload (Media Library) plugin exposes no public injection zone** for that dialog, its asset cards, or its actions — this was verified against the upload admin source (`packages/core/upload/admin/src`). Injection zones in v5 are a **Content Manager–only** feature. Putting a button inside the Media Library modal would require patching/forking Strapi core, which isn't maintainable.

So this plugin uses the two **fully supported** surfaces instead:

1. The **Content Manager Document Action API** (`getPlugin('content-manager').apis.addDocumentAction`) — chosen over a raw `injectComponent` because it receives the current `document` as a prop and avoids the `unstable_useContentManagerContext` hook (which has known edit-view/production issues).
2. A **dedicated admin page** that reuses the Media Library's own `GET /upload/files` endpoint — giving a Media-Library-like "rotate any asset" experience without forking core.

If a future Strapi release adds a Media Library injection zone, wiring the existing `RotateActions` component into it is a one-liner.

---

## 📄 License

[MIT](./LICENSE)
