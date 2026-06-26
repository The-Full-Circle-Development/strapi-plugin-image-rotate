import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { Routes, Route } from "react-router-dom";
import { useFetchClient, Page, Layouts } from "@strapi/strapi/admin";
import { useState, useCallback, useEffect } from "react";
import { Flex, Loader, Box, Typography, Button } from "@strapi/design-system";
import { u as useIntl, i as isRotatableImage, P as PLUGIN_ID, b as bustCache, R as RotateActions } from "./index-B6nnfl2S.mjs";
const PAGE_SIZE = 12;
const HomePage = () => {
  const { formatMessage } = useIntl();
  const { get } = useFetchClient();
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [status, setStatus] = useState("loading");
  const [stamps, setStamps] = useState({});
  const fetchFiles = useCallback(
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
        setItems(results.filter((f) => isRotatableImage(f)));
        setPageCount(pagination?.pageCount ?? 1);
        setStatus("success");
      } catch (err) {
        setStatus("error");
      }
    },
    [get]
  );
  useEffect(() => {
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
  return /* @__PURE__ */ jsxs(Page.Main, { children: [
    /* @__PURE__ */ jsx(
      Layouts.Header,
      {
        title: formatMessage({ id: `${PLUGIN_ID}.page.title`, defaultMessage: "Image Rotate" }),
        subtitle: formatMessage({
          id: `${PLUGIN_ID}.page.subtitle`,
          defaultMessage: "Rotate uploaded images 90° in place — overwrites the file and regenerates thumbnails."
        })
      }
    ),
    /* @__PURE__ */ jsxs(Layouts.Content, { children: [
      status === "loading" && /* @__PURE__ */ jsx(Flex, { justifyContent: "center", padding: 8, children: /* @__PURE__ */ jsx(Loader, { children: formatMessage({ id: `${PLUGIN_ID}.page.loading`, defaultMessage: "Loading images…" }) }) }),
      status === "error" && /* @__PURE__ */ jsx(Box, { padding: 6, background: "danger100", hasRadius: true, children: /* @__PURE__ */ jsx(Typography, { textColor: "danger600", children: formatMessage({
        id: `${PLUGIN_ID}.page.error`,
        defaultMessage: "Could not load images from the Media Library."
      }) }) }),
      status === "success" && items.length === 0 && /* @__PURE__ */ jsx(Box, { padding: 6, background: "neutral100", hasRadius: true, children: /* @__PURE__ */ jsx(Typography, { textColor: "neutral600", children: formatMessage({
        id: `${PLUGIN_ID}.page.empty`,
        defaultMessage: "No images found in the Media Library."
      }) }) }),
      status === "success" && items.length > 0 && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(Flex, { wrap: "wrap", gap: 4, alignItems: "stretch", children: items.map((file) => {
          const previewUrl = file.formats?.thumbnail?.url ?? file.url;
          const src = bustCache(previewUrl, stamps[file.id] ?? file.updatedAt);
          return /* @__PURE__ */ jsxs(
            Flex,
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
                /* @__PURE__ */ jsx(
                  Box,
                  {
                    background: "neutral150",
                    hasRadius: true,
                    height: "140px",
                    overflow: "hidden",
                    style: { display: "flex", alignItems: "center", justifyContent: "center" },
                    children: /* @__PURE__ */ jsx(
                      Box,
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
                /* @__PURE__ */ jsx(Typography, { variant: "pi", fontWeight: "bold", ellipsis: true, children: file.name }),
                /* @__PURE__ */ jsxs(Typography, { variant: "pi", textColor: "neutral600", children: [
                  file.ext?.replace(".", "").toUpperCase(),
                  file.width && file.height ? ` · ${file.width}×${file.height}` : ""
                ] }),
                /* @__PURE__ */ jsx(Flex, { justifyContent: "flex-end", paddingTop: 1, children: /* @__PURE__ */ jsx(RotateActions, { fileId: file.id, onRotated: (data) => handleRotated(file.id, data) }) })
              ]
            },
            file.id
          );
        }) }),
        pageCount > 1 && /* @__PURE__ */ jsxs(Flex, { justifyContent: "center", gap: 2, paddingTop: 6, children: [
          /* @__PURE__ */ jsx(
            Button,
            {
              variant: "tertiary",
              disabled: page <= 1,
              onClick: () => setPage((p) => Math.max(1, p - 1)),
              children: formatMessage({ id: `${PLUGIN_ID}.page.previous`, defaultMessage: "Previous" })
            }
          ),
          /* @__PURE__ */ jsx(Flex, { paddingLeft: 2, paddingRight: 2, alignItems: "center", children: /* @__PURE__ */ jsxs(Typography, { textColor: "neutral600", children: [
            page,
            " / ",
            pageCount
          ] }) }),
          /* @__PURE__ */ jsx(
            Button,
            {
              variant: "tertiary",
              disabled: page >= pageCount,
              onClick: () => setPage((p) => Math.min(pageCount, p + 1)),
              children: formatMessage({ id: `${PLUGIN_ID}.page.next`, defaultMessage: "Next" })
            }
          )
        ] })
      ] })
    ] })
  ] });
};
const App = () => {
  return /* @__PURE__ */ jsxs(Routes, { children: [
    /* @__PURE__ */ jsx(Route, { index: true, element: /* @__PURE__ */ jsx(HomePage, {}) }),
    /* @__PURE__ */ jsx(Route, { path: "*", element: /* @__PURE__ */ jsx(Page.Error, {}) })
  ] });
};
export {
  App as default
};
