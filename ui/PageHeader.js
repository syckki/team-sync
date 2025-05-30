import React from 'react';
import styled from 'styled-components';

const HeaderBanner = styled.div`
  background-color: hsl(217 91% 60%);
  color: white;
  padding: 1.25rem 1.5rem;
  margin-bottom: 1.5rem;
`;

const PageTitle = styled.h1`
  color: white;
  margin: 0;
  font-size: 1.125rem;
  line-height: 1.5rem;
  letter-spacing: -0.025em;
  font-weight: 500;
  display: flex;
  align-items: center;

  /* Reduce size on mobile devices */
  @media (max-width: 576px) {
    font-size: 1rem;
    line-height: 1.3rem;
  }
`;

const LockIcon = styled.div`
  width: 1.25rem;
  height: auto;
  margin-right: 0.5rem;
  display: inline-flex;

  /* Reduce size on mobile devices */
  @media (max-width: 576px) {
    width: 1rem;
    margin-right: 0.15rem;
  }
`;

const PageSubtitle = styled.p`
  margin: 0;
  margin-top: 0.375rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: rgb(255 255 255 / 0.9);

  /* Adjust size on mobile devices */
  @media (max-width: 576px) {
    font-size: 0.8rem;
    line-height: 1.1rem;
    margin-top: 0.25rem;
  }
`;

/**
 * PageHeader component with consistent styling for page headers
 * 
 * @param {object} props - Component props
 * @param {string} props.title - Page title
 * @param {string} props.subtitle - Page subtitle
 * @param {React.ReactNode} props.icon - Optional icon component
 * @param {boolean} props.showLock - Whether to show the default lock icon
 * @param {string} props.className - Additional CSS classes
 * @returns {React.ReactElement} - Rendered PageHeader component
 */
const PageHeader = ({ 
  title, 
  subtitle, 
  icon, 
  showLock = true,
  className,
  ...restProps
}) => {
  return (
    <HeaderBanner className={className} {...restProps}>
      <PageTitle>
        {showLock && (
          <LockIcon>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </LockIcon>
        )}
        {icon && <LockIcon>{icon}</LockIcon>}
        {title}
      </PageTitle>
      {subtitle && <PageSubtitle>{subtitle}</PageSubtitle>}
    </HeaderBanner>
  );
};

export { HeaderBanner, PageTitle, PageSubtitle, LockIcon };
export default PageHeader;