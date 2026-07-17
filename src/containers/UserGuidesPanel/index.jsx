import React from 'react';
import { getConfig } from '@edx/frontend-platform';

import './index.scss';

const GUIDE_ITEMS = [
  {
    id: 'civil-servants',
    title: 'Hướng dẫn sử dụng dành cho công chức, viên chức',
    description: 'Bao gồm tài liệu PDF và video hướng dẫn.',
    configKey: 'GUIDE_CIVIL_SERVANTS_URL',
  },
  {
    id: 'ministry-agencies',
    title: 'Hướng dẫn sử dụng dành cho cơ quan thuộc Bộ Xây dựng',
    description: 'Bao gồm tài liệu PDF và video hướng dẫn.',
    configKey: 'GUIDE_MINISTRY_AGENCY_URL',
  },
];

const UserGuidesPanel = () => {
  const config = getConfig();

  const openGuide = (url) => {
    if (!url) {
      return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <section className="user-guides-panel" aria-label="Tài liệu hướng dẫn">
      <div className="user-guides-panel__header">
        <h2>Tài liệu hướng dẫn sử dụng</h2>
        <p>
          Chọn nhóm tài liệu cần xem. Mỗi liên kết mở Google Drive ở tab mới.
        </p>
      </div>

      <div className="user-guides-panel__grid">
        {GUIDE_ITEMS.map((item) => {
          const link = config[item.configKey] || '';
          const isConfigured = Boolean(link);

          return (
            <article key={item.id} className="user-guides-panel__card">
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <button
                type="button"
                className="user-guides-panel__button"
                onClick={() => openGuide(link)}
                disabled={!isConfigured}
                aria-disabled={!isConfigured}
              >
                {isConfigured ? 'Mở hướng dẫn' : 'Chưa cấu hình liên kết'}
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default UserGuidesPanel;
