import { createBrowserInspector } from "@statelyai/inspect";
import { useState, useEffect } from "react";
import styled, { createGlobalStyle } from "styled-components";
import { useIsMobile } from "../hooks/useIsMobile";

export const GlobalStyles = createGlobalStyle`
  body > div[id*="next"] {
    display: grid !important;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto 1fr auto;
    grid-template-areas: 
        "header fab"
        "main fab"
        "footer fab";

    > header {
      grid-area: header;
    }

    > main {
      grid-area: main;
    }

    > footer {
      grid-area: footer;
    }

    > div {
      grid-area: fab;

      > iframe {
        width: 100%;
        height: 100dvh;
        position: static;
      }
    }
  }
`;

const FABWrapper = styled.div``;

const FABContainer = styled.div`
  position: fixed;
  bottom: 110px;
  right: 20px;
  z-index: 1001;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
`;

const FAB = styled.button`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background-color: ${(props) => props.theme.colors.primary};
  color: #fff;
  border: none;
  box-shadow: 0 3px 5px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 24px;

  &:hover {
    background-color: ${(props) =>
      props.theme.colors.primaryDark || props.theme.colors.primary};
    transform: scale(1.05);
    box-shadow: 0 5px 8px rgba(0, 0, 0, 0.3);
  }

  &:focus {
    outline: none;
  }
`;

const SplitLayout = styled(FAB)`
  background-color: ${(props) => props.theme.colors.secondary || "#4caf50"};

  &:hover {
    background-color: ${(props) =>
      props.theme.colors.secondaryDark || "#388e3c"};
  }
`;

const StyledIframe = styled.iframe`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: none;
  z-index: 1000;
  display: ${(props) => (props.$isOpen ? "block" : "none")};
`;

const isBrowser = typeof window !== "undefined";

export const inspector = createBrowserInspector({
  // Comment out the line below to start the inspector
  autoStart: false,
  iframe: isBrowser && document.querySelector("#inspector-iframe"),
});

/**
 * XState Inspector Button component
 * Provides a floating action button that opens the XState inspector in an iframe
 *
 * @returns {React.ReactElement}
 */
const XStateInspectorButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSplitted, setIsSplitted] = useState(false);
  const iframeSrc = "https://stately.ai/inspect";
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isMobile) setIsSplitted(false);
  }, [isMobile]);

  // Close iframe with escape key
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
        setIsSplitted(false);
      }
    };

    window.addEventListener("keydown", handleEsc);

    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen]);

  const toggleIframe = () => {
    if (!isOpen) {
      inspector.start();
      // reload iframe to ensure it's up to date
      const iframe = document.querySelector("#inspector-iframe");
      if (iframe) {
        setTimeout(() => {
          iframe.src = iframeSrc;
        }, 2000);
      }
    } else {
      inspector.stop();
      setIsSplitted(false);
    }

    setIsOpen(!isOpen);
  };

  const toggleLayout = () => {
    setIsSplitted(!isSplitted);
  };

  return (
    <>
      {isSplitted && <GlobalStyles />}

      <FABWrapper>
        <FABContainer>
          {isOpen && !isMobile && (
            <SplitLayout
              onClick={toggleLayout}
              aria-label="Split view with XState inspector"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                {!isSplitted && <line x1="12" y1="3" x2="12" y2="21" />}
              </svg>
            </SplitLayout>
          )}
          <FAB onClick={toggleIframe} aria-label="Toggle XState inspector">
            {isOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg width="24" viewBox="0 0 24 30" focusable="false">
                <path
                  d="M18.3667 6.13915C19.4969 5.00897 19.4969 3.17658 18.3667 2.0464C17.2365 0.91622 15.4042 0.916221 14.274 2.0464C13.1438 3.17658 13.1438 5.00897 14.274 6.13915C15.4042 7.26933 17.2365 7.26933 18.3667 6.13915Z"
                  fill="currentColor"
                ></path>
                <path
                  d="M23.324 16.8104L11.8042 5.29057L7.71649 1.20288C5.45306 3.46631 5.47558 7.10356 7.72775 9.36699L12.6938 14.333L12.6825 14.3443L15.4977 17.1595C15.5991 17.2608 15.6666 17.4072 15.6666 17.5536C15.6666 17.7113 15.5878 17.8577 15.4865 17.959L12.1983 21.2472C11.9731 21.4724 11.624 21.4724 11.3988 21.2472L8.11062 17.9477C7.8854 17.7225 7.8854 17.3734 8.11062 17.1482C10.3628 14.7497 8.68492 11.8782 7.63767 10.9097L6.90571 10.1778L0.32938 16.7654C-0.109793 17.2045 -0.109793 17.914 0.32938 18.3531L11.0047 29.0284C11.4438 29.4676 12.1533 29.4676 12.5924 29.0284L23.2452 18.3757C23.4817 18.1842 23.6281 17.8914 23.6281 17.5649C23.6281 17.2721 23.5042 17.0018 23.324 16.8104Z"
                  fill="currentColor"
                ></path>
              </svg>
            )}
          </FAB>
        </FABContainer>

        <StyledIframe
          id="inspector-iframe"
          $isOpen={isOpen}
          src={iframeSrc}
          title="Embedded Content"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </FABWrapper>
    </>
  );
};

export default XStateInspectorButton;
