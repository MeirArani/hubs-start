export default class Hub {
  name = '';
  scene = { screenshot_url: '' };
  hub_id = '';
  embed_token?: string;
  member_permissions = { textChat: true };
}

type TurnInfoEnabled = {
  enabled: true;
  username: string;
  credential: string;
  transports: { port: number }[];
};

type TurnInfoDisabled = {
  enabled: false;
};

export type TurnInfo = TurnInfoEnabled | TurnInfoDisabled;
