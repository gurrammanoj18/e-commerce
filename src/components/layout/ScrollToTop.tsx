import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const location = useLocation();

  useEffect(() => {
    const previousScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";

    const scrollWindowToTop = () => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    };

    scrollWindowToTop();
    window.addEventListener("load", scrollWindowToTop);
    window.addEventListener("pageshow", scrollWindowToTop);

    return () => {
      window.history.scrollRestoration = previousScrollRestoration;
      window.removeEventListener("load", scrollWindowToTop);
      window.removeEventListener("pageshow", scrollWindowToTop);
    };
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  return null;
};

export default ScrollToTop;
