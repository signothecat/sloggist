// components/ui/Avatar.js
import styles from "@/styles/avatar.module.css";
import { Cat, Clover, Dog, Fish, Rabbit, Squirrel, Turtle, UserRound } from "lucide-react";

const ICON_MAP = {
  cat: Cat,
  dog: Dog,
  clover: Clover,
  squirrel: Squirrel,
  turtle: Turtle,
  rabbit: Rabbit,
  userRound: UserRound,
  fish: Fish,
};

export default function Avatar({
  avatar, // { version, preset: { icon, hue, bg, fg }, image? }
  size = 24,
  radius = "50%",
  className,
  style,
  fill = true,
}) {
  const preset = avatar?.preset ?? null;
  const Icon = ICON_MAP[preset?.icon] || UserRound;

  const background = preset?.bg || "hsl(210 20% 96%)";
  const foreground = preset?.fg || "hsl(210 10% 30%)";
  const boxSize = size + 8;

  // TBA: 画像アップロードに対応
  // if (avatar?.image?.url) { ... }

  return (
    <div
      className={`${styles.avatar} ${className || ""}`}
      style={{
        "--avatar-bg": background,
        "--avatar-fg": foreground,
        width: boxSize,
        height: boxSize,
        borderRadius: radius,
        backgroundColor: background,
        color: foreground,
        ...style,
      }}
      aria-hidden="true"
    >
      <Icon className={styles.icon} size={size} fill={fill ? "currentColor" : "#222"} strokeWidth={fill ? 0 : 2} />
    </div>
  );
}
