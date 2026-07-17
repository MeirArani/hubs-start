import { ParaglideMessage } from '@inlang/paraglide-js-react';
import Container from './Container';
import { m } from '@/paraglide/messages';
import { Link } from '@tanstack/react-router';
// import '#/styles/sass/layout/Footer.module.scss'

export default function Footer({
  hidePoweredBy = false,
}: {
  hidePoweredBy?: boolean;
}) {
  return (
    <footer className="block bg-bg-secondary text-md p-5 lg:p-0 lg:flex">
      <Container
        as="div"
        className="flex flex-col items-center lg:h-20 lg:flex-row lg:items-[inherit]"
      >
        <div className="text-center text-primary flex flex-col justify-center lg:ml-5">
          <ParaglideMessage
            message={m['footer.powered-by']}
            markup={{
              a: ({ children }) => (
                <a href="https://hubsfoundation.org">{children}</a>
              ),
            }}
          />
        </div>
        {/* <nav className='flex lg:flex-1 lg:justify-end'>
          <ul className='flex flex-col m-0 p-0 list-none items-center lg:flex-row'></ul>
        </nav> */}
      </Container>
    </footer>
  );
}
