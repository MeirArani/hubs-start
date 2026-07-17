import AppLogo from '../AppLogo';
import heroImage from '../../../public/home-hero-background-unbranded.png';
import Container from '../layout/Container';

// import '#/styles/sass/home/HomePage.module.scss'
import PageContainer from '../layout/PageContainer';
import CreateRoomButton from '../input/CreateRoomButton';

export default function HomePage() {
  return (
    <PageContainer className="flex-1 bg-cover p-0 flex flex-col items-center lg:justify-start grow">
      <Container className="my-8 mx-auto">
        <div className="flex flex-col items-center flex-1 lg:flex-row">
          <div className="flex flex-col items-center flex-1 lg:hidden">
            <span>Signed in as "email"</span>
            <a href="#" className="p-2">
              <span>Sign Out</span>
            </a>
          </div>
          <div className="flex justify-center p-5 w-37.5 lg:hidden">
            <AppLogo className="w-full self-start" />
          </div>
          <div className="flex flex-col justify-center items-center mb-5 *:mb-5 lg:mb-0 lg:ml-4 lg:justify-start lg:items-start last:mb-0">
            <div className="whitespace-pre-wrap self-auto text-lg font-medium text-center mt-0 mr-6 mb-5 ml-6 leading-tight lg:text-left lg:mt-0 lg:mr-4 lg:mb-12 lg:ml-0 lg:max-w-215 lg:text-2xl ">
              Gather, share, and collaborate together in a virtual, private, and
              safe space.
            </div>
            <CreateRoomButton />
          </div>
          <div>
            <img src={heroImage} className="lg:rounded-2xl"></img>
          </div>
        </div>
      </Container>
      {/* <Container className="features col-lg center-lg">
          <Column padding gap="xl" className="card">
            <img src={tempImg}></img>
            <h3>Instantly create rooms</h3>
            <p>
              Share virtual spaces with your friends, co-workers, and
              communities. When you create a room with Hubs, you’ll have a
              private virtual meeting space that you can instantly share{' '}
              <b>- no downloads or VR headset necessary.</b>
            </p>
          </Column>
          <Column padding gap="xl" className="card">
            <img src={tempImg}></img>
            <h3>Communicate and Collaborate</h3>
            <p>
              Choose an avatar to represent you, put on your headphones, and
              jump right in. Hubs makes it easy to stay connected with voice and
              text chat to other people in your private room.
            </p>
          </Column>
          <Column padding gap="xl" className="card">
            <img src={tempImg}></img>
            <h3 id="home-page.media-title">An easier way to share media</h3>
            <p>
              Share content with others in your room by dragging and dropping
              photos, videos, PDF files, links, and 3D models into your space.
            </p>
          </Column>
        </Container> */}
    </PageContainer>
  );
}
