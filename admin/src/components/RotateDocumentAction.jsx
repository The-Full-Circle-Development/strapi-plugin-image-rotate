import { Button } from '@strapi/design-system';
import { useIntl } from 'react-intl';

import { PLUGIN_ID } from '../pluginId';
import { collectImageFiles } from '../utils/collectImages';
import { RotateRightIcon } from './icons';
import { RotateModal } from './RotateModal';

/**
 * A Content Manager Document Action (registered via
 * `getPlugin('content-manager').apis.addDocumentAction`).
 *
 * We use the Document Action API rather than a raw `injectComponent`, because it
 * hands us the current `document` as a prop — no reliance on the unstable
 * `unstable_useContentManagerContext` hook (which has known issues in the edit-view
 * sidebar / production builds). The action only appears when the entry actually
 * contains rotatable images, and opens a modal with per-image rotate controls.
 */
const RotateDocumentAction = ({ document }) => {
  const { formatMessage } = useIntl();

  const images = collectImageFiles(document);

  // Returning null hides the action entirely (e.g. on create, or no image fields).
  if (!images.length) {
    return null;
  }

  return {
    label: formatMessage({
      id: `${PLUGIN_ID}.action.rotateImages`,
      defaultMessage: 'Rotate images',
    }),
    icon: <RotateRightIcon />,
    position: ['panel'],
    dialog: {
      type: 'modal',
      title: formatMessage({
        id: `${PLUGIN_ID}.modal.title`,
        defaultMessage: 'Rotate images',
      }),
      content: <RotateModal images={images} />,
      footer: ({ onClose }) => (
        <Button onClick={onClose} variant="tertiary">
          {formatMessage({ id: `${PLUGIN_ID}.modal.close`, defaultMessage: 'Close' })}
        </Button>
      ),
    },
  };
};

RotateDocumentAction.type = `${PLUGIN_ID}-rotate-images`;

export { RotateDocumentAction };
