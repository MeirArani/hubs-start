import { store } from '#/store/store';

export function getPromotionTokenForFile(fileId: string) {
  return store.state.uploadPromotionTokens?.find(
    (upload) => upload.fieldId === fileId,
  );
}
