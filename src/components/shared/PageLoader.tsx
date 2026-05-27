import React, { CSSProperties } from "react";
import "../../styles/shared/LoadingState.css";

interface PageLoaderProps {
  title?: string;
  message?: string;
}

const PageLoader: React.FC<PageLoaderProps> = ({
  title = "Welcome",
  message = "Preparing your storefront...",
}) => {
  const titleStyle = {
    "--typing-characters": title.length,
  } as CSSProperties;

  const messageStyle = {
    "--typing-characters": message.length,
  } as CSSProperties;

  return (
    <section className="page-loader" aria-live="polite" aria-busy="true">
      <div className="page-loader__content">
        <h1 className="page-loader__title">
          <span className="page-loader__typing" style={titleStyle}>
            {title}
          </span>
        </h1>
        <p className="page-loader__message">
          <span
            className="page-loader__typing page-loader__typing--message"
            style={messageStyle}
          >
            {message}
          </span>
        </p>
      </div>
    </section>
  );
};

export default PageLoader;
