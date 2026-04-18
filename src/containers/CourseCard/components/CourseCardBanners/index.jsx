import React from 'react';
import PropTypes from 'prop-types';

import { reduxHooks } from 'hooks';

import CourseBannerSlot from 'plugin-slots/CourseBannerSlot';
import CertificateBanner from './CertificateBanner';
import CreditBanner from './CreditBanner';
import EntitlementBanner from './EntitlementBanner';
import RelatedProgramsBanner from './RelatedProgramsBanner';

export const CourseCardBanners = ({ cardId }) => null; // eslint-disable-line no-unused-vars
CourseCardBanners.propTypes = {
  cardId: PropTypes.string.isRequired,
};

export default CourseCardBanners;
