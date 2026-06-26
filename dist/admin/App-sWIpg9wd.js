"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const jsxRuntime = require("react/jsx-runtime");
const reactRouterDom = require("react-router-dom");
const admin = require("@strapi/strapi/admin");
const React = require("react");
const designSystem = require("@strapi/design-system");
const index = require("./index-HCcwSsJS.js");
const PAGE_SIZE = 12;
const HomePage = () => {
  const { formatMessage } = index.useIntl();
  const { get } = admin.useFetchClient();
  const [items, setItems] = React.useState([]);
  const [page, setPage] = React.useState(1);
  const [pageCount, setPageCount] = React.useState(1);
  const [status, setStatus] = React.useState("loading");
  const [stamps, setStamps] = React.useState({});
  const fetchFiles = React.useCallback(
    async (targetPage) => {
      setStatus("loading");
      try {
        const query = [
          "sort=updatedAt:DESC",
          `page=${targetPage}`,
          `pageSize=${PAGE_SIZE}`,
          "filters[mime][$startsWith]=image"
        ].join("&");
        const { data } = await get(`/upload/files?${query}`);
        const results = Array.isArray(data) ? data : data?.results ?? [];
        const pagination = Array.isArray(data) ? null : data?.pagination;
        setItems(results.filter((f) => index.isRotatableImage(f)));
        setPageCount(pagination?.pageCount ?? 1);
        setStatus("success");
      } catch (err) {
        setStatus("error");
      }
    },
    [get]
  );
  React.useEffect(() => {
    fetchFiles(page);
  }, [page, fetchFiles]);
  const handleRotated = (fileId, data) => {
    setStamps((prev) => ({ ...prev, [fileId]: Date.now() }));
    setItems(
      (prev) => prev.map(
        (f) => f.id === fileId ? { ...f, width: data?.width ?? f.width, height: data?.height ?? f.height, url: data?.url ?? f.url, formats: data?.formats ?? f.formats } : f
      )
    );
  };
  return /* @__PURE__ */ jsxRuntime.jsxs(admin.Page.Main, { children: [
    /* @__PURE__ */ jsxRuntime.jsx(
      admin.Layouts.Header,
      {
        title: formatMessage({ id: `${index.PLUGIN_ID}.page.title`, defaultMessage: "Image Rotate" }),
        subtitle: formatMessage({
          id: `${index.PLUGIN_ID}.page.subtitle`,
          defaultMessage: "Rotate uploaded images 90° in place — overwrites the file and regenerates thumbnails."
        })
      }
    ),
    /* @__PURE__ */ jsxRuntime.jsxs(admin.Layouts.Content, { children: [
      status === "loading" && /* @__PURE__ */ jsxRuntime.jsx(designSystem.Flex, { justifyContent: "center", padding: 8, children: /* @__PURE__ */ jsxRuntime.jsx(designSystem.Loader, { children: formatMessage({ id: `${index.PLUGIN_ID}.page.loading`, defaultMessage: "Loading images…" }) }) }),
      status === "error" && /* @__PURE__ */ jsxRuntime.jsx(designSystem.Box, { padding: 6, background: "danger100", hasRadius: true, children: /* @__PURE__ */ jsxRuntime.jsx(designSystem.Typography, { textColor: "danger600", children: formatMessage({
        id: `${index.PLUGIN_ID}.page.error`,
        defaultMessage: "Could not load images from the Media Library."
      }) }) }),
      status === "success" && items.length === 0 && /* @__PURE__ */ jsxRuntime.jsx(designSystem.Box, { padding: 6, background: "neutral100", hasRadius: true, children: /* @__PURE__ */ jsxRuntime.jsx(designSystem.Typography, { textColor: "neutral600", children: formatMessage({
        id: `${index.PLUGIN_ID}.page.empty`,
        defaultMessage: "No images found in the Media Library."
      }) }) }),
      status === "success" && items.length > 0 && /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
        /* @__PURE__ */ jsxRuntime.jsx(designSystem.Flex, { wrap: "wrap", gap: 4, alignItems: "stretch", children: items.map((file) => {
          const previewUrl = file.formats?.thumbnail?.url ?? file.url;
          const src = index.bustCache(previewUrl, stamps[file.id] ?? file.updatedAt);
          return /* @__PURE__ */ jsxRuntime.jsxs(
            designSystem.Flex,
            {
              direction: "column",
              alignItems: "stretch",
              gap: 2,
              padding: 3,
              background: "neutral0",
              shadow: "tableShadow",
              hasRadius: true,
              width: "220px",
              children: [
                /* @__PURE__ */ jsxRuntime.jsx(
                  designSystem.Box,
                  {
                    background: "neutral150",
                    hasRadius: true,
                    height: "140px",
                    overflow: "hidden",
                    style: { display: "flex", alignItems: "center", justifyContent: "center" },
                    children: /* @__PURE__ */ jsxRuntime.jsx(
                      designSystem.Box,
                      {
                        tag: "img",
                        src,
                        alt: file.name,
                        style: { maxWidth: "100%", maxHeight: "140px", objectFit: "contain" }
                      },
                      src
                    )
                  }
                ),
                /* @__PURE__ */ jsxRuntime.jsx(designSystem.Typography, { variant: "pi", fontWeight: "bold", ellipsis: true, children: file.name }),
                /* @__PURE__ */ jsxRuntime.jsxs(designSystem.Typography, { variant: "pi", textColor: "neutral600", children: [
                  file.ext?.replace(".", "").toUpperCase(),
                  file.width && file.height ? ` · ${file.width}×${file.height}` : ""
                ] }),
                /* @__PURE__ */ jsxRuntime.jsx(designSystem.Flex, { justifyContent: "flex-end", paddingTop: 1, children: /* @__PURE__ */ jsxRuntime.jsx(index.RotateActions, { fileId: file.id, onRotated: (data) => handleRotated(file.id, data) }) })
              ]
            },
            file.id
          );
        }) }),
        pageCount > 1 && /* @__PURE__ */ jsxRuntime.jsxs(designSystem.Flex, { justifyContent: "center", gap: 2, paddingTop: 6, children: [
          /* @__PURE__ */ jsxRuntime.jsx(
            designSystem.Button,
            {
              variant: "tertiary",
              disabled: page <= 1,
              onClick: () => setPage((p) => Math.max(1, p - 1)),
              children: formatMessage({ id: `${index.PLUGIN_ID}.page.previous`, defaultMessage: "Previous" })
            }
          ),
          /* @__PURE__ */ jsxRuntime.jsx(designSystem.Flex, { paddingLeft: 2, paddingRight: 2, alignItems: "center", children: /* @__PURE__ */ jsxRuntime.jsxs(designSystem.Typography, { textColor: "neutral600", children: [
            page,
            " / ",
            pageCount
          ] }) }),
          /* @__PURE__ */ jsxRuntime.jsx(
            designSystem.Button,
            {
              variant: "tertiary",
              disabled: page >= pageCount,
              onClick: () => setPage((p) => Math.min(pageCount, p + 1)),
              children: formatMessage({ id: `${index.PLUGIN_ID}.page.next`, defaultMessage: "Next" })
            }
          )
        ] })
      ] })
    ] })
  ] });
};
const App = () => {
  return /* @__PURE__ */ jsxRuntime.jsxs(reactRouterDom.Routes, { children: [
    /* @__PURE__ */ jsxRuntime.jsx(reactRouterDom.Route, { index: true, element: /* @__PURE__ */ jsxRuntime.jsx(HomePage, {}) }),
    /* @__PURE__ */ jsxRuntime.jsx(reactRouterDom.Route, { path: "*", element: /* @__PURE__ */ jsxRuntime.jsx(admin.Page.Error, {}) })
  ] });
};
exports.default = App;
