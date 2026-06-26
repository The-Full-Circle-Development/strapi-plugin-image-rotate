import { useState } from 'react';

import { Flex, IconButton } from '@strapi/design-system';
import { useFetchClient, useNotification } from '@strapi/strapi/admin';
import { useIntl } from 'react-intl';

import { PLUGIN_ID } from '../pluginId';
import { RotateLeftIcon, RotateRightIcon } from './icons';

/**
 * Two buttons that rotate a single Media Library file left/right by 90°.
 *
 * @param {object}   props
 * @param {number}   props.fileId      The Media Library file id.
 * @param {Function} [props.onRotated] Called with the updated file record on success.
 * @param {boolean}  [props.disabled]
 */
const RotateActions = ({ fileId, onRotated, disabled = false }) => {
  const { post } = useFetchClient();
  const { toggleNotification } = useNotification();
  const { formatMessage } = useIntl();
  const [loading, setLoading] = useState(false);

  const rotate = async (degrees) => {
    if (loading || disabled) return;
    setLoading(true);
    try {
      const { data } = await post(`/${PLUGIN_ID}/rotate/${fileId}`, { degrees });
      toggleNotification({
        type: 'success',
        message: formatMessage({
          id: `${PLUGIN_ID}.notification.success`,
          defaultMessage: 'Image rotated successfully.',
        }),
      });
      onRotated?.(data);
    } catch (err) {
      const message =
        err?.response?.data?.error?.message ||
        formatMessage({
          id: `${PLUGIN_ID}.notification.error`,
          defaultMessage: 'Failed to rotate the image.',
        });
      toggleNotification({ type: 'danger', message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex gap={1}>
      <IconButton
        onClick={() => rotate(-90)}
        disabled={loading || disabled}
        label={formatMessage({
          id: `${PLUGIN_ID}.action.rotateLeft`,
          defaultMessage: 'Rotate left 90°',
        })}
      >
        <RotateLeftIcon />
      </IconButton>
      <IconButton
        onClick={() => rotate(90)}
        disabled={loading || disabled}
        label={formatMessage({
          id: `${PLUGIN_ID}.action.rotateRight`,
          defaultMessage: 'Rotate right 90°',
        })}
      >
        <RotateRightIcon />
      </IconButton>
    </Flex>
  );
};

export { RotateActions };
