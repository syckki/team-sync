import { createGlobalStyle } from 'styled-components';
/*font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
  Ubuntu, Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;*/
export const GlobalStyles = createGlobalStyle`
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  
  html, body {
    font-family: ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
    -webkit-font-smoothing: antialiased;
    font-feature-settings: normal;
    font-variation-settings: normal;
    -webkit-tap-highlight-color: transparent;
    background-color: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text};
    line-height: 1.5;
    font-size: 16px;
  }
  
  a {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: underline;
    
    &:hover {
      color: ${({ theme }) => theme.colors.primaryDark};
    }
  }
  
  button {
    font-family: inherit;
  }
  
  p {
    margin-bottom: 1rem;
  }
  
  h1, h2, h3, h4, h5, h6 {
    margin-top: 0;
    margin-bottom: 0.5rem;
    font-weight: 600;
    line-height: 1.2;
  }
  
  code {
    font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New', monospace;
    background-color: ${({ theme }) => theme.colors.codeBg};
    padding: 0.2em 0.4em;
    border-radius: 3px;
    font-size: 0.9em;
  }
  
  ::selection {
    background-color: ${({ theme }) => theme.colors.primaryLight};
    color: ${({ theme }) => theme.colors.text};
  }
`;
