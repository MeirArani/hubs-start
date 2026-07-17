// import '@/styles/sass/room/SpectatingLabel.module.scss';
import { m } from '@/paraglide/messages';

export interface SpectatingLabelProps {
  name?: string;
}
export function SpectatingLabel({ name }: SpectatingLabelProps) {
  return (
    <div className="absolute b-4 l-4 flex flex-col text-white text-wrap shadow-[0px_0px_3px_black]">
      <b>{m['spectating-label.label']()}</b>
      <p>{name}</p>
    </div>
  );
}
