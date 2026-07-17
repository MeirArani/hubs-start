// REIMP
export function isLockedDownDemoRoom() {
  return false;
  //   if (APP.hubChannel?.canOrWillIfCreator("update_hub")) return;
  //   const hubId = getCurrentHubId();
  //   // TODO: Update config logic (setFeature, getFeature, etc)
  //   if (configs.HUBS_APP_CONFIG.features("is_locked_down_demo_room")) {
  //     const idArr = configs.feature("is_locked_down_demo_room").replace(/\s/g, "").split(",");
  //     return idArr.includes(hubId);
  //   } else {
  //     return false;
  //   }
}
