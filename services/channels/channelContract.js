// services/channels/channelContract.js

// === フィールド制約 ===

export const SERVER_CHANNEL_SELECT = {
  userId: true,
  name: true,
  slug: true,
  isHome: true,
};

export const SAFE_CHANNEL_SELECT = {
  name: true,
  slug: true,
  isHome: true,
};

export const toChannelDisplay = channel => {
  return {
    name: channel.name,
    slug: channel.slug,
    isHome: channel.isHome ?? false,
  };
};
