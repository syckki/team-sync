import Link from "next/link";
import styled from "styled-components";

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
`;

const Logo = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary};
`;

const LogoLink = styled(Link)`
  text-decoration: none;
  color: inherit;
  display: flex;
  align-items: center;
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
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
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
