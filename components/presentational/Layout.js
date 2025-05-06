import styled from "styled-components";
import Header from "./Header";
import MinWidthWarning from "./MinWidthWarning";
import { Breakpoint } from "../../lib/styles";

const Main = styled.main`
  margin: 0 auto;
  padding: 2rem;
  width: 100%;
  
  @media (max-width: ${Breakpoint.MOBILE_LANDSCAPE}px) {
    padding: 1rem;
  }
`;

const Footer = styled.footer`
  background-color: ${({ theme }) => theme.colors.card};
  padding: 1.5rem;
  text-align: center;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textLight};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  margin-top: auto;
`;

const Layout = ({ children }) => {
  return (
    <>
      <MinWidthWarning minWidth={360} />
      <Header />
      <Main>{children}</Main>
      <Footer>
        <p>
          &copy; {new Date().getFullYear()} TeamSync. All data is encrypted in
          your browser. Nothing is stored on a server. Collaboration stays
          private, secure, and end-to-end encrypted.
        </p>
      </Footer>
    </>
  );
};

export default Layout;
