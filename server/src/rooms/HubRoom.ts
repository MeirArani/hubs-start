import { Room, Client, CloseCode } from 'colyseus';
import { HubRoomState, Player } from './schema/HubRoomState.js';

interface HubMetadata {}

interface HubClient extends Client {
  messages: {
    playerMove: string;
  };
}

export class HubsRoom extends Room<{
  state: HubRoomState;
  metadata: HubMetadata;
  client: HubClient;
}> {
  maxClients = 4;
  state = new HubRoomState();

  messages = {
    playerMove: (client: Client, message: any) => {
      // console.log(client.sessionId, 'sent a message:', message);
      const player = this.state.players.get(client.sessionId);
      player.x = message.x;
      player.y = message.y;
      player.z = message.z;
    },
  };

  onCreate(options: any) {
    /**
     * Called when a new room is created.
     */
  }

  onJoin(client: Client, options: any) {
    /**
     * Called when a client joins the room.
     */
    console.log(client.sessionId, 'joined!');
    this.state.players.set(client.sessionId, new Player());
    this.state.playerIds.push(client.sessionId);
  }

  onLeave(client: Client, code: CloseCode) {
    /**
     * Called when a client leaves the room.
     */
    console.log(client.sessionId, 'left!', code);
    this.state.players.delete(client.sessionId);
    const index = this.state.playerIds.indexOf(client.sessionId);
    if (index > -1) this.state.playerIds.splice(index, 1);
  }

  onDispose() {
    /**
     * Called when the room is disposed.
     */
    console.log('room', this.roomId, 'disposing...');
  }
}
