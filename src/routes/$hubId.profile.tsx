import { m } from '#/paraglide/messages';
import BackButton from '#/react-components/input/BackButton';
import { Modal } from '#/react-components/modal/Modal';
import { AvatarSettingsContent } from '#/react-components/room/AvatarSettingsContent';
import { store } from '#/store/store';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useSelector } from '@tanstack/react-store';

export const Route = createFileRoute('/$hubId/profile')({
  component: ProfileEntryPanel,
});

function ProfileEntryPanel() {
  const navigate = Route.useNavigate();
  return (
    <>
      <Modal
        title={m['avatar-setup-sidebar.title']()}
        beforeTitle={
          <BackButton
            onClick={() => {
              navigate({
                to: '/$hubId/entry',
              });
            }}
          />
        }
      >
        <AvatarSettingsContent />
      </Modal>
    </>
  );
}
