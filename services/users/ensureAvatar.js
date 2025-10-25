// services/users/ensureAvatar.js
import { prisma } from "@/lib/prisma";

/* {
 *   version: 1, // avatar形式のverification用
 *   preset: { icon: "cat", hue: 123, bg: "hsl(...)", fg: "hsl(...)" }
 *   image: ... // 将来
 * } */

const ICON_KEYS = ["cat", "dog", "clover", "squirrel", "turtle", "rabbit", "userRound", "fish"];

// hue(0-359)をもらってbgとfgの色を返す関数
const colorsFromHue = hue => ({
  bg: `hsl(${hue} 70% 92%)`, // 明るい
  fg: `hsl(${hue} 70% 30%)`, // 暗い
});

// minとmaxを含む範囲内でランダムで整数を出す関数
const randomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// ランダムに初期プリセットを作る関数
const createRandomPreset = () => {
  const icon = ICON_KEYS[randomInt(0, ICON_KEYS.length - 1)];
  const hue = randomInt(0, 359);
  const { bg, fg } = colorsFromHue(hue);
  return { icon, hue, bg, fg };
};

// 妥当性チェック
const isValidAvatar = avatar => {
  // avatarのチェック
  if (!avatar || typeof avatar !== "object") return false;
  if (avatar.version !== 1) return false;
  // avatar.presetのチェック
  const preset = avatar.preset;
  if (!preset || typeof preset !== "object") return false;
  // avatar.presetの要素チェック
  if (!ICON_KEYS.includes(preset.icon)) return false;
  if (typeof preset.hue !== "number" || preset.hue < 0 || preset.hue > 359) return false;
  if (typeof preset.bg !== "string" || typeof preset.fg !== "string") return false;
  // 問題がなければtrue
  return true;
};

export const ensureAvatar = async ({ userId, tx = prisma }) => {
  // user.idで現在のavatarを取得
  const current = await tx.user.findUnique({
    where: { id: userId },
    select: { avatar: true },
  });

  // === avatarがすでに登録されている場合 ===

  if (isValidAvatar(current?.avatar)) {
    return { avatar: current.avatar, created: false };
  }

  // === avatarが登録されてない場合 ===

  const avatar = {
    version: 1,
    preset: createRandomPreset(),
    // image: TBA
  };

  await tx.user.update({
    where: { id: userId },
    data: { avatar },
  });

  return { avatar, created: true };
};
