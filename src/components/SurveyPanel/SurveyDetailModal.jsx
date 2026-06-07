import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const SurveyDetailModal = ({ choice, onClose }) => {
  const dialogRef = useRef(null);

  // Focus trap + ESC close
  useEffect(() => {
    const previouslyFocused = document.activeElement;
    dialogRef.current?.focus();

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [onClose]);

  return (
    <div
      className="survey-detail-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="survey-detail-title"
        className="survey-detail-modal"
        tabIndex={-1}
      >
        <h3 id="survey-detail-title" className="survey-detail-modal__title">
          {choice.name}
        </h3>
        <div
          className="survey-detail-modal__body"
          /* detail_html is sanitized by bleach on the server before storage */
          dangerouslySetInnerHTML={{ __html: choice.detail_html }} // eslint-disable-line react/no-danger
        />
        <button
          type="button"
          className="survey-detail-modal__close-btn"
          onClick={onClose}
          aria-label="Đóng"
        >
          Đóng
        </button>
      </div>
    </div>
  );
};

SurveyDetailModal.propTypes = {
  choice: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    detail_html: PropTypes.string.isRequired,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
};

export default SurveyDetailModal;
