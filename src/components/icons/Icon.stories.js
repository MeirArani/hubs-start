import React from "react";
import AudioIcon from "./Audio.svg?react";
import AvatarIcon from "./Avatar.svg?react";
import CameraIcon from "./Camera.svg?react";
import CaretDownIcon from "./CaretDown.svg?react";
import ChatIcon from "./Chat.svg?react";
import ChatOffIcon from "./ChatOff.svg?react";
import ChevronBackIcon from "./ChevronBack.svg?react";
import CloseIcon from "./Close.svg?react";
import DeleteIcon from "./Delete.svg?react";
import DesktopIcon from "./Desktop.svg?react";
import DiscordIcon from "./Discord.svg?react";
import DocumentIcon from "./Document.svg?react";
import EnterIcon from "./Enter.svg?react";
import GIFIcon from "./GIF.svg?react";
import GoToIcon from "./GoTo.svg?react";
import HelpIcon from "./Help.svg?react";
import HideIcon from "./Hide.svg?react";
import ImageIcon from "./Image.svg?react";
import InviteIcon from "./Invite.svg?react";
import LeaveIcon from "./Leave.svg?react";
import LinkIcon from "./Link.svg?react";
import MicrophoneIcon from "./Microphone.svg?react";
import MicrophoneMutedIcon from "./MicrophoneMuted.svg?react";
import MoreIcon from "./More.svg?react";
import ObjectIcon from "./Object.svg?react";
import ObjectsIcon from "./Objects.svg?react";
import PenIcon from "./Pen.svg?react";
import PeopleIcon from "./People.svg?react";
import PhoneIcon from "./Phone.svg?react";
import PinIcon from "./Pin.svg?react";
import ReactionIcon from "./Reaction.svg?react";
import SceneIcon from "./Scene.svg?react";
import SettingsIcon from "./Settings.svg?react";
import ShareIcon from "./Share.svg?react";
import ShowIcon from "./Show.svg?react";
import StarIcon from "./Star.svg?react";
import TextIcon from "./Text.svg?react";
import UploadIcon from "./Upload.svg?react";
import VideoIcon from "./Video.svg?react";
import VolumeHighIcon from "./VolumeHigh.svg?react";
import VolumeMutedIcon from "./VolumeMuted.svg?react";
import VolumeOffIcon from "./VolumeOff.svg?react";
import VRIcon from "./VR.svg?react";
import WandIcon from "./Wand.svg?react";
import HmcLogo from "./HmcLogo.svg?react";

export default {
  title: "Icon",
  argTypes: {
    color: { control: "color" }
  }
};

export const AllIcons = args => (
  <>
    <AudioIcon {...args} />
    <AvatarIcon {...args} />
    <CameraIcon {...args} />
    <CaretDownIcon {...args} />
    <ChatIcon {...args} />
    <ChatOffIcon {...args} />
    <ChevronBackIcon {...args} />
    <CloseIcon {...args} />
    <DeleteIcon {...args} />
    <DesktopIcon {...args} />
    <DiscordIcon {...args} />
    <DocumentIcon {...args} />
    <EnterIcon {...args} />
    <GIFIcon {...args} />
    <GoToIcon {...args} />
    <HelpIcon {...args} />
    <HideIcon {...args} />
    <HmcLogo {...args} />
    <ImageIcon {...args} />
    <InviteIcon {...args} />
    <LeaveIcon {...args} />
    <LinkIcon {...args} />
    <MicrophoneIcon {...args} />
    <MicrophoneMutedIcon {...args} />
    <MoreIcon {...args} />
    <ObjectIcon {...args} />
    <ObjectsIcon {...args} />
    <PenIcon {...args} />
    <PeopleIcon {...args} />
    <PhoneIcon {...args} />
    <PinIcon {...args} />
    <ReactionIcon {...args} />
    <SceneIcon {...args} />
    <SettingsIcon {...args} />
    <ShareIcon {...args} />
    <ShowIcon {...args} />
    <StarIcon {...args} />
    <TextIcon {...args} />
    <UploadIcon {...args} />
    <VideoIcon {...args} />
    <VolumeHighIcon {...args} />
    <VolumeMutedIcon {...args} />
    <VolumeOffIcon {...args} />
    <VRIcon {...args} />
    <WandIcon {...args} />
  </>
);

AllIcons.parameters = {
  color: "#000"
};
