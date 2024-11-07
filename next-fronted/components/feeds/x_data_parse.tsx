export const XDataParse = (twitters: any) => {
  const result: string[] = [];

  twitters.forEach((twitter: any) => {
    if (
      twitter.x_id.startsWith("tweet-") ||
      twitter.x_id.startsWith("profile-conversation-")
    ) {
      // 处理 top-level URLs 和 full_text
      if (twitter.data.urls) {
        Object.values(twitter.data.urls).forEach((value) => {
          const urlList = value as string[];

          urlList.forEach((url) => result.push(url));
        });
      }

      if (twitter.data.full_text) {
        const cleanText = twitter.data.full_text
          .replace(/https:\/\/t\.co\/\S+/g, "")
          .trim();

        result.push(cleanText);
      }

      // 如果 data 是数组（如 profile-conversation-），处理子元素
      if (Array.isArray(twitter.data)) {
        twitter.data.forEach((subItem: any) => {
          if (subItem.data.urls) {
            Object.values(subItem.data.urls).forEach((value) => {
              const urlList = value as string[];

              urlList.forEach((url) => result.push(url));
            });
          }

          if (subItem.data.full_text) {
            const cleanText = subItem.data.full_text
              .replace(/https:\/\/t\.co\/\S+/g, "")
              .trim();

            result.push(cleanText);
          }
        });
      }
    }
  });

  return result;
};
