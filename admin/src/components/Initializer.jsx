import { useEffect, useRef } from 'react';

import { PLUGIN_ID } from '../pluginId';

/**
 * Flips the plugin's `isReady` flag once mounted. Standard Strapi plugin boilerplate.
 */
const Initializer = ({ setPlugin }) => {
  const ref = useRef(setPlugin);

  useEffect(() => {
    ref.current(PLUGIN_ID);
  }, []);

  return null;
};

export { Initializer };
