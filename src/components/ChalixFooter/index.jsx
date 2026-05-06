import React from 'react';
import { AppContext } from '@edx/frontend-platform/react';
import { getConfig } from '@edx/frontend-platform';
import { reduxHooks } from 'hooks';
import './index.scss';

const ChalixFooter = () => {
  const { authenticatedUser } = React.useContext(AppContext);
  const platformSettings = reduxHooks.usePlatformSettingsData();
  const config = getConfig();

  // Get current year
  const currentYear = new Date().getFullYear();
  
  // Get platform/site name for copyright
  const siteName = config.SITE_NAME || platformSettings?.siteName || 'Chalix';
  
  // Show the responsible-person line only when an explicit value exists.
  const responsiblePerson = (
    platformSettings?.adminName
    || authenticatedUser?.name
    || authenticatedUser?.username
    || ''
  ).trim();

  return (
    <div className="chalix-footer">
      <div className="chalix-footer-container">
        <div className="footer-content">
          {responsiblePerson && <p>Chịu trách nhiệm nội dung bởi {responsiblePerson}</p>}
          <p>Copyright © {currentYear} {siteName}</p>
        </div>
      </div>
    </div>
  );
};

export default ChalixFooter;
