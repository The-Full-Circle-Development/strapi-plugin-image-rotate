import { useCallback, useEffect, useState } from 'react';

import { Box, Button, Flex, Loader, Typography } from '@strapi/design-system';
import { Layouts, Page, useFetchClient } from '@strapi/strapi/admin';
import { useIntl } from 'react-intl';

import { PLUGIN_ID } from '../pluginId';
import { RotateActions } from '../components/RotateActions';
import { bustCache, isRotatableImage } from '../utils/collectImages';

const PAGE_SIZE = 12;

/**
 * Standalone "Image Rotate" page — the supported alternative to injecting into the
 * (non-extensible) Media Library edit dialog. Reuses the Media Library's own admin
 * endpoint `GET /upload/files` to browse images, with rotate controls per asset.
 */
const HomePage = () => {
  const { formatMessage } = useIntl();
  const { get } = useFetchClient();

  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [stamps, setStamps] = useState({});

  const fetchFiles = useCallback(
    async (targetPage) => {
      setStatus('loading');
      try {
        const query = [
          'sort=updatedAt:DESC',
          `page=${targetPage}`,
          `pageSize=${PAGE_SIZE}`,
          'filters[mime][$startsWith]=image',
        ].join('&');

        const { data } = await get(`/upload/files?${query}`);

        // The admin endpoint paginates as { results, pagination }; older shapes
        // may return a bare array.
        const results = Array.isArray(data) ? data : data?.results ?? [];
        const pagination = Array.isArray(data) ? null : data?.pagination;

        setItems(results.filter((f) => isRotatableImage(f)));
        setPageCount(pagination?.pageCount ?? 1);
        setStatus('success');
      } catch (err) {
        setStatus('error');
      }
    },
    [get]
  );

  useEffect(() => {
    fetchFiles(page);
  }, [page, fetchFiles]);

  const handleRotated = (fileId, data) => {
    setStamps((prev) => ({ ...prev, [fileId]: Date.now() }));
    // Reflect the new dimensions/url without a full refetch.
    setItems((prev) =>
      prev.map((f) =>
        f.id === fileId
          ? { ...f, width: data?.width ?? f.width, height: data?.height ?? f.height, url: data?.url ?? f.url, formats: data?.formats ?? f.formats }
          : f
      )
    );
  };

  return (
    <Page.Main>
      <Layouts.Header
        title={formatMessage({ id: `${PLUGIN_ID}.page.title`, defaultMessage: 'Image Rotate' })}
        subtitle={formatMessage({
          id: `${PLUGIN_ID}.page.subtitle`,
          defaultMessage:
            'Rotate uploaded images 90° in place — overwrites the file and regenerates thumbnails.',
        })}
      />

      <Layouts.Content>
        {status === 'loading' && (
          <Flex justifyContent="center" padding={8}>
            <Loader>
              {formatMessage({ id: `${PLUGIN_ID}.page.loading`, defaultMessage: 'Loading images…' })}
            </Loader>
          </Flex>
        )}

        {status === 'error' && (
          <Box padding={6} background="danger100" hasRadius>
            <Typography textColor="danger600">
              {formatMessage({
                id: `${PLUGIN_ID}.page.error`,
                defaultMessage: 'Could not load images from the Media Library.',
              })}
            </Typography>
          </Box>
        )}

        {status === 'success' && items.length === 0 && (
          <Box padding={6} background="neutral100" hasRadius>
            <Typography textColor="neutral600">
              {formatMessage({
                id: `${PLUGIN_ID}.page.empty`,
                defaultMessage: 'No images found in the Media Library.',
              })}
            </Typography>
          </Box>
        )}

        {status === 'success' && items.length > 0 && (
          <>
            <Flex wrap="wrap" gap={4} alignItems="stretch">
              {items.map((file) => {
                const previewUrl = file.formats?.thumbnail?.url ?? file.url;
                const src = bustCache(previewUrl, stamps[file.id] ?? file.updatedAt);

                return (
                  <Flex
                    key={file.id}
                    direction="column"
                    alignItems="stretch"
                    gap={2}
                    padding={3}
                    background="neutral0"
                    shadow="tableShadow"
                    hasRadius
                    width="220px"
                  >
                    <Box
                      background="neutral150"
                      hasRadius
                      height="140px"
                      overflow="hidden"
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <Box
                        tag="img"
                        src={src}
                        key={src}
                        alt={file.name}
                        style={{ maxWidth: '100%', maxHeight: '140px', objectFit: 'contain' }}
                      />
                    </Box>

                    <Typography variant="pi" fontWeight="bold" ellipsis>
                      {file.name}
                    </Typography>
                    <Typography variant="pi" textColor="neutral600">
                      {file.ext?.replace('.', '').toUpperCase()}
                      {file.width && file.height ? ` · ${file.width}×${file.height}` : ''}
                    </Typography>

                    <Flex justifyContent="flex-end" paddingTop={1}>
                      <RotateActions fileId={file.id} onRotated={(data) => handleRotated(file.id, data)} />
                    </Flex>
                  </Flex>
                );
              })}
            </Flex>

            {pageCount > 1 && (
              <Flex justifyContent="center" gap={2} paddingTop={6}>
                <Button
                  variant="tertiary"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  {formatMessage({ id: `${PLUGIN_ID}.page.previous`, defaultMessage: 'Previous' })}
                </Button>
                <Flex paddingLeft={2} paddingRight={2} alignItems="center">
                  <Typography textColor="neutral600">
                    {page} / {pageCount}
                  </Typography>
                </Flex>
                <Button
                  variant="tertiary"
                  disabled={page >= pageCount}
                  onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                >
                  {formatMessage({ id: `${PLUGIN_ID}.page.next`, defaultMessage: 'Next' })}
                </Button>
              </Flex>
            )}
          </>
        )}
      </Layouts.Content>
    </Page.Main>
  );
};

export { HomePage };
