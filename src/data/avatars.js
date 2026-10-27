import femaleProfile from "../assets/femaleProfile.png";
import maleProfile from "../assets/maleProfile.png";

export const avatars = [
  { id: "female", label: "Female avatar", src: femaleProfile },
  { id: "male", label: "Male avatar", src: maleProfile },
];

export function getAvatar(avatarId) {
  const found = avatars.find(({ id }) => id === avatarId);
  if (!found) {
    // Return default female avatar as safe fallback if ID is unknown or "photo"
    return avatars[0];
  }
  return found;
}
