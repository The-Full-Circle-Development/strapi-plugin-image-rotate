import { useState } from 'react';

import { Box, Flex, Typography } from '@strapi/design-system';
import { useIntl } from 'react-intl';

import { PLUGIN_ID } from '../pluginId';
import { bustCache } from '../utils/collectImages';
import { RotateActions } from './RotateActions';

/**
 * Body content for the "Rotate images" modal opened from a Content Manager
 * Document Action. Lists every image in the current entry with rotate controls,
 * and refreshes each thumbnail in place after a successful rotation.
 *
 * @param {object}  props
 * @param {Array<{ field: string, file: object }>} props.images
 */
const RotateModal = ({ images }) => {
  const { formatMessage } = useIntl();
  // Per-file overrides applied after a rotation (new dimensions + cache-bust stamp).
  const [overrides, setOverrides] = useState({});

  const handleRotated = (fileId, data) => {
    setOverrides((prev) => ({
      ...prev,
      [fileId]: {
        width: data?.width,
        height: data?.height,
        url: data?.url,
        formats: data?.formats,
        stamp: Date.now(),
      },
    }));
  };

  if (!images.length) {
    return (
      <Typography textColor="neutral600">
        {formatMessage({
          id: `${PLUGIN_ID}.modal.empty`,
          defaultMessage: 'This entry has no rotatable images.',
        })}
      </Typography>
    );
  }

  return (
    <Flex direction="column" alignItems="stretch" gap={4}>
      {images.map(({ field, file }) => {
        const o = overrides[file.id];
        const width = o?.width ?? file.width;
        const height = o?.height ?? file.height;
        const previewUrl = o?.url ?? file.formats?.thumbnail?.url ?? file.url;
        const src = bustCache(previewUrl, o?.stamp ?? file.updatedAt);

        return (
          <Flex
            key={`${field}-${file.id}`}
            justifyContent="space-between"
            alignItems="center"
            gap={4}
            hasRadius
            padding={3}
            background="neutral100"
          >
            <Flex gap={3} alignItems="center">
              <Box
                tag="img"
                src={src}
                key={src}
                alt={file.name}
                width="56px"
                height="56px"
                hasRadius
                style={{ objectFit: 'cover', border: '1px solid rgba(0,0,0,0.1)' }}
              />
              <Flex direction="column" alignItems="flex-start" gap={1}>
                <Typography fontWeight="bold" ellipsis>
                  {file.name}
                </Typography>
                <Typography variant="pi" textColor="neutral600">
                  {field}
                  {width && height ? ` · ${width}×${height}` : ''}
                </Typography>
              </Flex>
            </Flex>

            <RotateActions fileId={file.id} onRotated={(data) => handleRotated(file.id, data)} />
          </Flex>
        );
      })}
    </Flex>
  );
};

export { RotateModal };
