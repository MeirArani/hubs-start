import { useEffect, type ReactNode } from 'react';
import { IntlProvider } from 'react-intl';

export default function WrappedIntlProvider({
  children,
}: {
  children?: ReactNode;
}) {
  // const [locale, setLocale] = useState('en')
  // const [messages, setMessages] = useState({})
  const updateLocale = () => {
    // setLocale('en')
    // setMessages({})
  };
  useEffect(() => {
    updateLocale();
    window.addEventListener('locale-updated', updateLocale);
    return () => {
      window.removeEventListener('locale-updated', updateLocale);
    };
  }, []);

  //   console.log(messages.locale)
  return (
    <IntlProvider defaultLocale="en" locale="en">
      {children}
    </IntlProvider>
  );
}
