import Link from "next/link";
import styled from "styled-components";
import { Breakpoint } from "../../lib/styles";

const HeaderContainer = styled.header`
  background-color: ${({ theme }) => theme.colors.card};
  padding: 1rem 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  /* Use column layout on small mobile devices */
  @media (max-width: ${Breakpoint.MOBILE_LANDSCAPE}px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const Logo = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary};
  
  /* Center logo on mobile */
  @media (max-width: ${Breakpoint.MOBILE_LANDSCAPE}px) {
    text-align: center;
  }
`;

const LogoLink = styled(Link)`
  text-decoration: none;
  color: inherit;
  display: flex;
  align-items: center;
  
  /* Center logo content on mobile */
  @media (max-width: ${Breakpoint.MOBILE_LANDSCAPE}px) {
    justify-content: center;
    margin: 0 auto;
  }
`;

const TaskIcon = styled.div`
  width: 2rem;
  height: 2rem;
  margin-right: 0.5rem;
  display: inline-flex;
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
  
  /* Center navigation on mobile */
  @media (max-width: ${Breakpoint.MOBILE_LANDSCAPE}px) {
    justify-content: center;
    width: 100%;
  }
`;

const StyledLink = styled(Link)`
  margin-left: 1.5rem;
  color: ${({ theme }) => theme.colors.text};
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
  
  /* Adjust spacing on mobile */
  @media (max-width: ${Breakpoint.MOBILE_LANDSCAPE}px) {
    margin: 0 0.75rem;
    font-size: 0.9rem;
  }
  
  &:first-child {
    @media (max-width: ${Breakpoint.MOBILE_LANDSCAPE}px) {
      margin-left: 0;
    }
  }
`;

const Header = () => {
  return (
    <HeaderContainer>
      <HeaderContent>
        <Logo>
          <LogoLink href="/">
            <TaskIcon>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="8" height="4" x="8" y="2" rx="1" ry="1"></rect>
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                <path d="M12 11h4"></path>
                <path d="M12 16h4"></path>
                <path d="M8 11h.01"></path>
                <path d="M8 16h.01"></path>
              </svg>
            </TaskIcon>
            AI Productivity Tracker
          </LogoLink>
        </Logo>

        <Nav>
          <StyledLink href="/">Thread New</StyledLink>
          <StyledLink href="/about">About</StyledLink>
        </Nav>
      </HeaderContent>
    </HeaderContainer>
  );
};

export default Header;
