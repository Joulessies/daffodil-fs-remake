import "../app/globals.scss";
import { SessionProviderWrapper } from "../components/SessionProvider";

export default function App({ Component, pageProps }) {
  return (
    <SessionProviderWrapper>
      <Component {...pageProps} />
    </SessionProviderWrapper>
  );
}
