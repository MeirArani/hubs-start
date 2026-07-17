// REIMP
export function getCurrentStreamer(): null | { streamerName: string } {
  return null;
  //   if (
  //     !window.APP ||
  //     !window.APP.componentRegistry ||
  //     !window.APP.hubChannel ||
  //     !window.APP.hubChannel.presence
  //   )
  //     return null;
  //   const playerInfos = window.APP.componentRegistry['player-info'] || [];
  //   const presences = window.APP.hubChannel.presence.state;

  //   for (let i = 0; i < playerInfos.length; i++) {
  //     const playerInfo = playerInfos[i] as NetworkedComponent;
  //     const presence = presences[playerInfo.playerSessionId];

  //     if (presence && presence.metas[0] && presence.metas[0].streaming) {
  //       return playerInfo;
  //     }
  //   }

  //   return null;
}
