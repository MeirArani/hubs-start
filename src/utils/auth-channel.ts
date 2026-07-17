import type HubChannel from '#/core/hub-channel';
import { Socket } from 'phoenix';
import { v4 as uuid } from 'uuid';

import { store } from '#/store/store';
import { resetToRandomDefaultAvatar } from './identity';

export default class AuthChannel {
  socket: Socket | null;
  _signedIn: boolean;
  constructor() {
    this.socket = null;
    this._signedIn = !!store;
  }

  setSocket = (socket: Socket) => {
    this.socket = socket;
  };

  get email() {
    return store.state.credentials.email;
  }

  get signedIn() {
    return this._signedIn;
  }

  signOut = async (hubChannel: HubChannel) => {
    if (hubChannel) {
      await hubChannel.signOut();
    }
    store.setState((prev) => ({
      ...prev,
      credentials: { token: null, email: null },
    }));
    await resetToRandomDefaultAvatar();
    this._signedIn = false;
  };

  verifyAuthentication(
    authTopic: string,
    authToken: string,
    authPayload: string,
  ) {
    if (!this.socket)
      return console.error(
        'Could not verify authentification! Socket is null!',
      );
    const channel = this.socket.channel(authTopic);
    return new Promise<void>((resolve, reject) => {
      channel.onError(() => {
        channel.leave();
        reject();
      });

      channel
        .join()
        .receive('ok', () => {
          channel.on(
            'auth_credentials',
            async ({ credentials: token, payload: payload }) => {
              await this.handleAuthCredentials(payload.email, token);
              resolve();
            },
          );

          channel.push('auth_verified', {
            token: authToken,
            payload: authPayload,
          });
        })
        .receive('error', reject);
    });
  }

  async startAuthentication(email: string, hubChannel?: HubChannel) {
    if (!this.socket) {
      console.error('Could not authenticate! Socket not found!');
      return { authComplete: null };
    }
    const channel = this.socket.channel(`auth:${uuid()}`);
    await new Promise((resolve, reject) =>
      channel.join().receive('ok', resolve).receive('error', reject),
    );

    const authComplete = new Promise<void>((resolve) =>
      channel.on('auth_credentials', async ({ credentials: token }) => {
        await this.handleAuthCredentials(email, token, hubChannel);
        resolve();
      }),
    );

    channel.push('auth_request', { email, origin: 'hubs' });

    // Returning an object with the authComplete promise since we want the caller to wait for the above await but not
    // for authComplete.
    return { authComplete };
  }

  async handleAuthCredentials(
    email: string,
    token: string,
    hubChannel?: HubChannel,
  ) {
    store.setState((prev) => ({ ...prev, credentials: { email, token } }));

    if (hubChannel) {
      await hubChannel.signIn(token);
    }

    this._signedIn = true;
  }
}
