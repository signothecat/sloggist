// components/ui/UserIcon.js
import styles from "@/styles/userIcon.module.css";
import { Cat, Clover, Dog, Fish, Rabbit, Squirrel, Turtle, UserRound } from "lucide-react";
import { useMemo, useRef } from "react";

const icons = [Cat, Dog, Clover, Squirrel, Turtle, Rabbit, UserRound, Fish];

function hashString(input) {
  let hashValue = 0; // initial hash
  for (const char of input) {
    hashValue = (hashValue << 5) - hashValue + char.charCodeAt(0);
    hashValue |= 0;
  }
  return Math.abs(hashValue);
}

function colorsFromNumber(baseKey) {
  const hue = baseKey % 360;
  return {
    bg: `hsl(${hue} 70% 92%)`,
    fg: `hsl(${hue} 70% 30%)`
  };
}

export default function UserIcon({
  userKey, // 乱数を作るためのキー（user.id, user.username, etc.）
  size = 24, // Iconのsize（px）
  bg = "auto",
  fg = "auto",
  iconSet = icons,
  strokeWidth = 2,
  radius = "50%",
  className,
  style
}) {
  const fixedRef = useRef(Math.floor(Math.random() * 1e9));
  const baseNumber = useMemo(() => (userKey ? hashString(String(userKey)) : fixedRef.current), [userKey]);
  const Icon = iconSet[baseNumber % iconSet.length];

  // 表示
  const auto = colorsFromNumber(baseNumber);
  const background = bg === "auto" ? auto.bg : bg;
  const foreground = fg === "auto" ? auto.fg : fg;
  const box = size + 8;

  return (
    <div
      className={`${styles.userIcon} ${className || ""}`}
      style={{
        "--userIcon-bg": background,
        "--userIcon-fg": foreground,
        width: box,
        height: box,
        borderRadius: radius,
        ...style
      }}
    >
      <Icon size={size} strokeWidth={strokeWidth} />
    </div>
  );
}
