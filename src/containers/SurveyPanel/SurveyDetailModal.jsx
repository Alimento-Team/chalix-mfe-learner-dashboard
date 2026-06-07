import React, { useState, useEffect, useRef } from 'react';
import { fetchChoiceDetail } from 'data/services/lms/surveyApi';

const SurveyDetailModal = ({ choice, publicToken, onClose }) => {
  const [detailHtml, setDetailHtml] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const modalRef = useRef(null);
  const firstInteractiveRef = useRef(null);
  const lastInteractiveRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchChoiceDetail(publicToken, choice.id);
        const detail = data?.detail_html ?? data?.choice?.detail_html ?? '';
        setDetailHtml(detail);
      } catch (e) {
        console.error('Error fetching choice detail:', e);
        setError('Không thể tải chi tiết.');
      } finally {
        setLoading(false);
      }
    })();
  }, [choice, publicToken]);

  // Focus trap and ESC key close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key === 'Tab') {
        const focusables = modalRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusables || focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    modalRef.current?.focus();
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <>
      {/* Backdrop */}
      <div className="survey-detail-modal__backdrop" onClick={onClose} />
      
      {/* Modal container */}
      <div
        className="survey-detail-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="survey-detail-modal-title"
        ref={modalRef}
        tabIndex={-1}
      >
        <div className="survey-detail-modal__header">
          <h2 id="survey-detail-modal-title" className="survey-detail-modal__title">
            {choice.name}
          </h2>
          <button
            type="button"
            className="survey-detail-modal__close-btn"
            onClick={onClose}
            aria-label="Đóng chi tiết"
          >
            ✕
          </button>
        </div>

        <div className="survey-detail-modal__content">
          {loading && <p>Đang tải...</p>}
          {error && <p className="survey-detail-modal__error">{error}</p>}
          {!loading && !error && (
            <div
              className="survey-detail-modal__html"
              dangerouslySetInnerHTML={{ __html: detailHtml }}
            />
          )}
        </div>

        <div className="survey-detail-modal__footer">
          <button
            type="button"
            ref={lastInteractiveRef}
            className="survey-detail-modal__close-footer-btn"
            onClick={onClose}
          >
            Đóng
          </button>
        </div>
      </div>
    </>
  );
};

export default SurveyDetailModal;
