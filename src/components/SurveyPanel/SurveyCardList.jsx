import React from 'react';
import PropTypes from 'prop-types';

const formatDateRange = (startsAt, endsAt) => {
  const formatMonthYear = (isoString) => {
    if (!isoString) return '—';
    const d = new Date(isoString);
    return `${d.getMonth() + 1}/${d.getFullYear()}`;
  };

  return `Từ tháng ${formatMonthYear(startsAt)} Đến tháng ${formatMonthYear(endsAt)}`;
};

const SurveyCardList = ({ surveys, onSelectSurvey }) => {
  return (
    <div className="survey-card-list">
      <h2 className="survey-card-list__title">Chọn khảo sát để tham gia</h2>
      <div className="survey-card-list__cards">
        {surveys.map(survey => (
          <div key={survey.public_token} className="survey-card">
            <div className="survey-card__content">
              <h3 className="survey-card__title">{survey.title}</h3>
              <p className="survey-card__date-range">
                {formatDateRange(survey.starts_at, survey.ends_at)}
              </p>
            </div>
            <button
              type="button"
              className="survey-card__select-btn"
              onClick={() => onSelectSurvey(survey.public_token)}
            >
              Tham gia
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

SurveyCardList.propTypes = {
  surveys: PropTypes.arrayOf(
    PropTypes.shape({
      public_token: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      starts_at: PropTypes.string,
      ends_at: PropTypes.string,
    }),
  ).isRequired,
  onSelectSurvey: PropTypes.func.isRequired,
};

export default SurveyCardList;
