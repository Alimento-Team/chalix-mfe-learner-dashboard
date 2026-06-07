import React, { useState } from 'react';
import SurveyDetailModal from './SurveyDetailModal';

const formatMonthYear = (isoString) => {
  if (!isoString) return '—';
  const d = new Date(isoString);
  return `${d.getMonth() + 1}/${d.getFullYear()}`;
};

const SurveyForm = ({ survey, groups, userPrefill, alreadySubmitted, onSubmit }) => {
  const [fullName, setFullName]     = useState(userPrefill?.full_name || '');
  const [email, setEmail]           = useState(userPrefill?.email || '');
  const [phone, setPhone]           = useState(userPrefill?.phone_number || '');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [otherEnabled, setOtherEnabled] = useState(false);
  const [otherText, setOtherText]   = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [detailChoice, setDetailChoice] = useState(null);   // triggers detail modal
  const [detailLoading, setDetailLoading] = useState(false); // loading state for detail button
  const [formError, setFormError]   = useState('');

  const allowMultipleChoice = !!survey?.allow_multiple_votes;
  const allowAddChoice = !!survey?.allow_add_choice;

  const toggleChoice = (id) => {
    if (allowMultipleChoice) {
      setSelectedIds(prev => {
        const next = new Set(prev);
        next.has(id) ? next.delete(id) : next.add(id);
        return next;
      });
      return;
    }
    setSelectedIds(new Set([id]));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) { setFormError('Vui lòng nhập họ và tên'); return; }
    if (!email.trim())    { setFormError('Vui lòng nhập email');       return; }
    setFormError('');
    setSubmitting(true);
    try {
      await onSubmit({
        full_name: fullName.trim(),
        email: email.trim(),
        phone_number: phone.trim(),
        selected_choice_ids: [...selectedIds],
        other_text: otherEnabled ? otherText.trim() : '',
      });
    } catch (err) {
      setFormError('Gửi khảo sát không thành công. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  if (alreadySubmitted) {
    return (
      <div className="survey-form survey-form--submitted">
        <h2 className="survey-form__title">{survey.title || 'KHẢO SÁT NHU CẦU HỌC TẬP, BỒI DƯỠNG'}</h2>
        <p className="survey-form__success-msg">
          ✓ Bạn đã nộp khảo sát này. Cảm ơn bạn đã tham gia!
        </p>
      </div>
    );
  }

  return (
    <>
      <form className="survey-form" onSubmit={handleSubmit} noValidate>
        <h2 className="survey-form__title">
          {survey.title || 'KHẢO SÁT NHU CẦU HỌC TẬP, BỒI DƯỠNG'}
        </h2>

        {/* Date row */}
        <div className="survey-form__date-row">
          <span>Từ tháng <strong>{formatMonthYear(survey.starts_at)}</strong></span>
          <span className="survey-form__date-sep">Đến tháng <strong>{formatMonthYear(survey.ends_at)}</strong></span>
        </div>

        {/* Contact fields */}
        <div className="survey-form__contact-row">
          <label className="survey-form__field">
            <span>Họ tên</span>
            <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} required />
          </label>
          <label className="survey-form__field">
            <span>Điện thoại</span>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} />
          </label>
          <label className="survey-form__field">
            <span>Email</span>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </label>
        </div>

        {/* Grouped choices */}
        {groups.map((group, gi) => (
          <div key={gi} className="survey-form__group">
            {group.group_name && (
              <h3 className="survey-form__group-title">{group.group_name}</h3>
            )}
            {group.choices.map(choice => (
              <div key={choice.id} className="survey-form__choice-row">
                <label className="survey-form__choice-label">
                  <input
                    type={allowMultipleChoice ? 'checkbox' : 'radio'}
                    name={allowMultipleChoice ? undefined : 'survey-single-choice'}
                    checked={selectedIds.has(choice.id)}
                    onChange={() => toggleChoice(choice.id)}
                  />
                  <span>{choice.name}</span>
                </label>
                {choice.has_detail && (
                  <button
                    type="button"
                    className="survey-form__detail-btn"
                    disabled={detailLoading}
                    onClick={() => {
                      setDetailLoading(true);
                      setDetailChoice(choice);
                    }}
                  >
                    {detailLoading ? 'Đang tải...' : 'Chi tiết'}
                  </button>
                )}
              </div>
            ))}
          </div>
        ))}

        {allowAddChoice && (
          <div className="survey-form__other-row">
            <label className="survey-form__choice-label">
              <input
                type="checkbox"
                checked={otherEnabled}
                onChange={e => setOtherEnabled(e.target.checked)}
              />
              <span>Khác:</span>
            </label>
            {otherEnabled && (
              <input
                type="text"
                className="survey-form__other-input"
                placeholder="Tên chương trình khác..."
                value={otherText}
                onChange={e => setOtherText(e.target.value)}
                maxLength={500}
              />
            )}
          </div>
        )}

        {formError && <p className="survey-form__error" role="alert">{formError}</p>}

        <button
          type="submit"
          className="survey-form__submit-btn"
          disabled={submitting}
        >
          {submitting ? 'Đang gửi...' : 'Gửi khảo sát'}
        </button>
      </form>

      {/* Detail modal — rendered outside form to avoid nested form issues */}
      {detailChoice && (
        <SurveyDetailModal
          choice={detailChoice}
          publicToken={survey.public_token}
          onClose={() => {
            setDetailChoice(null);
            setDetailLoading(false);
          }}
        />
      )}
    </>
  );
};

export default SurveyForm;
