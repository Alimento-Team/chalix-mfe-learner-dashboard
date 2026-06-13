import React from 'react';
import PropTypes from 'prop-types';

import { useIntl } from '@edx/frontend-platform/i18n';

import track from 'tracking';
import { reduxHooks } from 'hooks';
import useActionDisabledState from '../hooks';
import ActionButton from './ActionButton';
import messages from './messages';

export const BeginCourseButton = ({ cardId }) => {
  const { formatMessage } = useIntl();
  const { homeUrl } = reduxHooks.useCardCourseRunData(cardId);
  const execEdTrackingParam = reduxHooks.useCardExecEdTrackingParam(cardId);
  const { disableBeginCourse } = useActionDisabledState(cardId);

  const courseUrl = homeUrl ? (homeUrl + execEdTrackingParam) : '';
  const handleClick = reduxHooks.useTrackCourseEvent(
    track.course.enterCourseClicked,
    cardId,
    courseUrl,
  );
  return (
    <ActionButton
      disabled={disableBeginCourse || !courseUrl}
      as="a"
      href={courseUrl}
      onClick={handleClick}
    >
      {formatMessage(messages.beginCourse)}
    </ActionButton>
  );
};
BeginCourseButton.propTypes = {
  cardId: PropTypes.string.isRequired,
};
export default BeginCourseButton;
