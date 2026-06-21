import AppLogo from '../AppLogo'
import heroImage from '../../../public/home-hero-background-unbranded.png'
import Container from '../layout/Container'

import '#/styles/sass/home/HomePage.module.scss'
import PageContainer from '../layout/PageContainer'
import CreateRoomButton from '../input/CreateRoomButton'

export default function HomePage() {
  return (
    <PageContainer className="home-page">
      <Container>
        <div className="hero">
          <div className="sign-in-container">
            <span>Signed in as "email"</span>
            <a href="#" className="mobile-sign-out">
              <span>Sign Out</span>
            </a>
          </div>
          <div className="logo-container">
            <AppLogo />
          </div>
          <div className="app-info">
            <div className="app-description">
              Gather, share, and collaborate together in a virtual, private, and
              safe space.
            </div>
            <CreateRoomButton />
          </div>
          <div className="hero-image-container">
            <img src={heroImage}></img>
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
  )
}
