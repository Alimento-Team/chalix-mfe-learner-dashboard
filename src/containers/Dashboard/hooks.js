import React from 'react';
import { useWindowSize, breakpoints } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import { apiHooks } from 'hooks';
import { StrictDict } from 'utils';

import appMessages from 'messages';
import * as module from './hooks';

export const state = StrictDict({
  sidebarShowing: (val) => React.useState(val), // eslint-disable-line
});

export const useInitializeDashboard = (filterType = null) => {
  const initialize = apiHooks.useInitializeApp(filterType);
  React.useEffect(() => { initialize(); }, [filterType]); // eslint-disable-line
};

export const useDashboardMessages = () => {
  const { formatMessage } = useIntl();
  return {
    spinnerScreenReaderText: formatMessage(appMessages.loadingSR),
    pageTitle: formatMessage(appMessages.pageTitle),
  };
};

export const useDashboardLayoutData = () => {
  const { width } = useWindowSize();

  // Default sidebar hidden to give the course list full width unless explicitly enabled
  const [sidebarShowing, setSidebarShowing] = module.state.sidebarShowing(false);
  return {
    isDashboardCollapsed: width < breakpoints.large.maxWidth,
    sidebarShowing,
    setSidebarShowing,
  };
};

export default {
  useDashboardLayoutData,
  useInitializeDashboard,
  useDashboardMessages,
};
