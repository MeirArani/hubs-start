import type { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
// import '#/styles/sass/layout/Page.module.scss'

export default function Page({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <>
      <Header />
      <main className={className}>{children}</main>
      <Footer />
    </>
  );
}
