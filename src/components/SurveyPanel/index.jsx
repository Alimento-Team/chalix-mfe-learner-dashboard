import React, { useState, useEffect } from 'react';
import { fetchActiveSurveys, fetchSurveyDetail, submitSurveyResponse } from 'data/services/lms/surveyApi';
import SurveyCardList from './SurveyCardList';
import SurveyForm from './SurveyForm';
import './index.scss';

const SurveyPanel = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [surveys, setSurveys] = useState([]); // list of available surveys
  const [selectedSurveyToken, setSelectedSurveyToken] = useState(null); // user selected this
  const [activeSurvey, setActiveSurvey] = useState(null); // full detail response
  const [submitted, setSubmitted] = useState(false);

  // Stage 1: Load survey list
  useEffect(() => {
    (async () => {
      try {
        const result = await fetchActiveSurveys();
        const surveyList = result.surveys || [];
        setSurveys(surveyList);

        // Auto-advance if only one survey
        if (surveyList.length === 1) {
          setSelectedSurveyToken(surveyList[0].public_token);
        }
      } catch (e) {
        setError('Không thể tải khảo sát. Vui lòng thử lại sau.');
        console.error('Error loading surveys:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Stage 2: Load survey detail once selected
  useEffect(() => {
    if (!selectedSurveyToken) return;

    (async () => {
      try {
        const detail = await fetchSurveyDetail(selectedSurveyToken);
        setActiveSurvey(detail);
        if (detail.already_submitted) setSubmitted(true);
      } catch (e) {
        setError('Không thể tải chi tiết khảo sát. Vui lòng thử lại sau.');
        console.error('Error loading survey detail:', e);
      }
    })();
  }, [selectedSurveyToken]);

  const handleSelectSurvey = (publicToken) => {
    setSelectedSurveyToken(publicToken);
  };

  const handleBack = () => {
    setSelectedSurveyToken(null);
    setActiveSurvey(null);
    setSubmitted(false);
  };

  const handleSubmit = async (payload) => {
    try {
      await submitSurveyResponse(selectedSurveyToken, payload);
      setSubmitted(true);
    } catch (e) {
      console.error('Error submitting survey:', e);
      throw e;
    }
  };

  if (loading) {
    return <div className="survey-panel__loading">Đang tải khảo sát...</div>;
  }
  if (error) {
    return <div className="survey-panel__error">{error}</div>;
  }

  // Stage 1: Show survey list if no survey selected yet
  if (!selectedSurveyToken) {
    if (surveys.length === 0) {
      return (
        <div className="survey-panel__empty">
          Hiện không có khảo sát nào đang mở.
        </div>
      );
    }
    return (
      <SurveyCardList
        surveys={surveys}
        onSelectSurvey={handleSelectSurvey}
      />
    );
  }

  // Stage 2: Show survey form after selection
  if (!activeSurvey) {
    return <div className="survey-panel__loading">Đang tải khảo sát...</div>;
  }

  return (
    <div className="survey-panel">
      <button
        type="button"
        className="survey-panel__back-btn"
        onClick={handleBack}
      >
        ← Quay lại
      </button>
      <SurveyForm
        survey={activeSurvey.survey}
        groups={activeSurvey.groups}
        userPrefill={activeSurvey.user_prefill}
        alreadySubmitted={submitted}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default SurveyPanel;
