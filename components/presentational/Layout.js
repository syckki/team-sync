import styled from "styled-components";
import Header from "./Header";
import MinWidthWarning from "./MinWidthWarning";
import { Breakpoint } from "../../lib/styles";

const Main = styled.main`
  /*max-width: 1200px;*/
  margin: 0 auto;
  padding: 2rem;
  min-height: calc(
    100vh - 120px
  ); /* Adjust based on header and footer height */

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
`;

const Layout = ({ children }) => {
  return (
    <>
      <MinWidthWarning minWidth={360} />
      <Header />
      <Main>{children}</Main>
      <Footer>
        <p>
          &copy; {new Date().getFullYear()} AI Productivity Tracker. All
          encryption happens in your browser. Your data remains private.
        </p>
      </Footer>
    </>
  );
};

export default Layout;
