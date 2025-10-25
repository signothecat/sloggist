// services/logs/logContract.js

// === フィールド制約 ===

export const SAFE_LOG_AUTHOR_SELECT = {
  username: true,
  handle: true,
  avatar: true,
};

export const SAFE_LOG_SELECT = {
  slug: true,
  content: true,
  createdAt: true,
  user: { select: SAFE_LOG_AUTHOR_SELECT },
};

// === クライアント用フォーマット関数 ===

export const toLogDisplay = log => {
  return {
    slug: log.slug,
    content: log.content,
    createdAt: log.createdAt,
    user: {
      username: log.user?.username ?? null,
      handle: log.user?.handle ?? null,
      avatar: log.user?.avatar ?? null,
    },
  };
};
