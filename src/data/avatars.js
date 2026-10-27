import femaleProfile from "../assets/femaleProfile.png";
import maleProfile from "../assets/maleProfile.png";

export const avatars = [
  { id: "female", label: "Female avatar", src: femaleProfile },
  { id: "male", label: "Male avatar", src: maleProfile },
];

export function getAvatar(avatarId) {
  const avatar = avatars.find(({ id }) => id === avatarId);
  if (!avatar) {
    throw new Error(`Unknown avatar: ${avatarId}`);
  }
  return avatar;
}
