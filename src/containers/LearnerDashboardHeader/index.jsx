import React from 'react';
import { ChalixHeaderWithUserPopup } from '@chalix/frontend-component-header';

import MasqueradeBar from 'containers/MasqueradeBar';
import { AppContext } from '@edx/frontend-platform/react';
import { reduxHooks } from 'hooks';
import urls from 'data/services/lms/urls';
import { getConfig } from '@edx/frontend-platform';

import ConfirmEmailBanner from './ConfirmEmailBanner';

import { useLearnerDashboardHeaderMenu, findCoursesNavClicked } from './hooks';

import './index.scss';

export const LearnerDashboardHeader = () => {
  const { authenticatedUser } = React.useContext(AppContext);
  const { courseSearchUrl } = reduxHooks.usePlatformSettingsData();

  const exploreCoursesClick = () => {
    findCoursesNavClicked(urls.baseAppUrl(courseSearchUrl));
  };

  const learnerHomeHeaderMenu = useLearnerDashboardHeaderMenu({
    courseSearchUrl,
    authenticatedUser,
    exploreCoursesClick,
  });

  const handleNavigate = (tab) => {
    const config = getConfig();
    switch (tab) {
      case 'home':
        window.location.href = `${config.LMS_BASE_URL}/dashboard`;
        break;
      case 'category':
        window.location.href = urls.baseAppUrl(courseSearchUrl);
        break;
      case 'learning':
        window.location.href = `${config.LMS_BASE_URL}/learning`;
        break;
      case 'personalize':
        window.location.href = `${config.LMS_BASE_URL}/personalize`;
        break;
      default:
        break;
    }
  };

  const handleUserMenuItemClick = (item) => {
    if (item.href) {
      window.location.href = item.href;
    }
  };

  return (
    <ChalixHeaderWithUserPopup
      organizationTitle="PHẦN MỀM HỌC TẬP THÔNG MINH DÀNH CHO CÔNG CHỨC, VIÊN CHỨC"
      searchPlaceholder="Nhập từ khóa tìm kiếm"
      onNavigate={handleNavigate}
      onUserMenuItemClick={handleUserMenuItemClick}
    />
  );
};

LearnerDashboardHeader.propTypes = {};

export default LearnerDashboardHeader;
