import React from 'react';
import {
  Container,
  Navbar,
  Nav,
  Button,
  Dropdown,
  Image,
} from '@openedx/paragon';
import { 
  Person, 
  Search, 
  MenuIcon,
  NotificationsNone
} from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import { getConfig } from '@edx/frontend-platform';
import './ChalixHeader.scss';

const ChalixHeader = () => {
  const intl = useIntl();
  const config = getConfig();

  return (
    <header className="chalix-header">
      <Navbar expand="lg" className="chalix-navbar" variant="light">
        <Container fluid className="px-4">
          {/* Logo Section */}
          <Navbar.Brand href={config.LMS_BASE_URL} className="chalix-brand">
            <Image
              src={config.LOGO_URL || '/static/chalix_theme/images/logo.svg'}
              alt={config.SITE_NAME}
              height="40"
            />
          </Navbar.Brand>

          {/* Mobile Menu Toggle */}
          <Navbar.Toggle aria-controls="chalix-navbar-nav" className="d-lg-none">
            <MenuIcon size="24" />
          </Navbar.Toggle>

          {/* Main Navigation */}
          <Navbar.Collapse id="chalix-navbar-nav">
            <Nav className="mx-auto chalix-main-nav">
              <Nav.Link href="/learner-dashboard" className="chalix-nav-link">
                Trang chủ
              </Nav.Link>
              <Nav.Dropdown title="Học tập" id="learning-nav-dropdown" className="chalix-nav-link">
                <Dropdown.Item href="/learner-dashboard">Bảng điều khiển</Dropdown.Item>
                <Dropdown.Item href="/learner-dashboard?tab=survey">Khảo sát nhu cầu</Dropdown.Item>
              </Nav.Dropdown>
              <Nav.Link href="/courses" className="chalix-nav-link">
                Khóa học
              </Nav.Link>
              <Nav.Link href="/programs" className="chalix-nav-link">
                Chương trình
              </Nav.Link>
              <Nav.Link href="/library" className="chalix-nav-link">
                Thư viện
              </Nav.Link>
              <Nav.Link href="/about" className="chalix-nav-link">
                Về chúng tôi
              </Nav.Link>
            </Nav>

            {/* Right Side Actions */}
            <div className="chalix-header-actions d-flex align-items-center">
              {/* Search */}
              <Button
                variant="outline-primary" 
                className="chalix-search-btn me-3"
                iconBefore={Search}
              >
                <span className="d-none d-md-inline">Tìm kiếm</span>
              </Button>

              {/* Notifications */}
              <Button
                variant="outline-secondary"
                className="chalix-notification-btn me-3"
                iconBefore={NotificationsNone}
                aria-label="Thông báo"
              />

              {/* User Menu */}
              <Dropdown>
                <Dropdown.Toggle
                  variant="outline-primary"
                  className="chalix-user-toggle"
                  id="user-dropdown"
                >
                  <Person size="20" />
                  <span className="d-none d-md-inline ms-2">Tài khoản</span>
                </Dropdown.Toggle>

                <Dropdown.Menu align="end" className="chalix-user-menu">
                  <Dropdown.Item href="/account">
                    Hồ sơ cá nhân
                  </Dropdown.Item>
                  <Dropdown.Item href="/account/settings">
                    Cài đặt tài khoản
                  </Dropdown.Item>
                  <Dropdown.Item href="/dashboard">
                    Bảng điều khiển
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item href="/logout">
                    Đăng xuất
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
};

export default ChalixHeader;
