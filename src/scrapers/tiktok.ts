import { z } from 'zod';

// ---------------------------------------------------------------------------
// Zod schemas — validate only the fields actually consumed by the mapper.
// All fields are optional so that missing/extra API keys fall back gracefully.
// ---------------------------------------------------------------------------

const UrlListSchema = z.object({ url_list: z.array(z.string()).optional() }).optional();

const TiktokImageItemSchema = z.object({
  display_image: UrlListSchema,
});

const TiktokAwemeSchema = z.object({
  aweme_id: z.string().optional(),
  desc: z.string().optional(),
  music: z
    .object({
      id_str: z.string().optional(),
      title: z.string().optional(),
      author: z.string().optional(),
      play_url: z.object({ uri: z.string().optional() }).optional(),
      duration: z.number().optional(),
      cover_thumb: UrlListSchema,
      album: z.string().optional(),
    })
    .optional(),
  statistics: z.record(z.string(), z.number()).optional(),
  author: z
    .object({
      uid: z.string().optional(),
      unique_id: z.string().optional(),
      nickname: z.string().optional(),
      avatar_thumb: UrlListSchema,
      region: z.string().optional(),
    })
    .optional(),
  image_post_info: z
    .object({ images: z.array(TiktokImageItemSchema).optional() })
    .optional(),
  video: z
    .object({
      cover: UrlListSchema,
      dynamic_cover: UrlListSchema,
      origin_cover: UrlListSchema,
      play_addr: z
        .object({ url_list: z.array(z.string()).optional(), data_size: z.number().optional() })
        .optional(),
      download_addr: z
        .object({ url_list: z.array(z.string()).optional(), data_size: z.number().optional() })
        .optional(),
      duration: z.number().optional(),
    })
    .optional(),
});

const TiktokApiResponseSchema = z.object({
  aweme_list: z.array(TiktokAwemeSchema).optional(),
});

// ---------------------------------------------------------------------------
// TypeScript types — derived from Zod so they stay in sync automatically.
// ---------------------------------------------------------------------------

export type TiktokImageItem = z.infer<typeof TiktokImageItemSchema>;
export type TiktokAweme = z.infer<typeof TiktokAwemeSchema>;
export type TiktokApiResponse = z.infer<typeof TiktokApiResponseSchema>;

export type TiktokImageResult = {
  id: string;
  desc: string;
  cover: string;
  dynamic_cover: string;
  origin_cover: string;
  image_url: string[];
};

export type TiktokVideoResult = {
  id: string;
  desc: string;
  cover: string;
  dynamic_cover: string;
  origin_cover: string;
  download_url: string;
  download_url_wm: string;
  duration: number;
  size: number;
  wm_size: number;
};

export type TiktokResult = {
  music: {
    id: string;
    title: string;
    author: string;
    url: string;
    duration: number;
    cover: string;
    album: string;
  };
  statistics: Record<string, number>;
  author: {
    id: string;
    username: string;
    nickname: string;
    avatar: string;
    region: string;
  };
  image?: TiktokImageResult;
  video?: TiktokVideoResult;
};

const delay = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

export const tiktokdl = async (url: string): Promise<TiktokResult> => {
  const invalidOrUnavailableMessage = 'Invalid link or video/photo unavailable';

  if (url.includes('vm.tiktok.com') || url.includes('vt.tiktok.com')) {
    const response = await fetch(url, {
      redirect: 'follow',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });
    url = response.url;
  }

  const isVideo = url.includes('/video/');
  const isPhoto = url.includes('/photo/');
  if (!isVideo && !isPhoto) throw new Error(invalidOrUnavailableMessage);

  const marker = isVideo ? '/video/' : '/photo/';
  const id = url.substring(url.indexOf(marker) + marker.length, url.indexOf(marker) + 26).split('?')[0];
  if (!id) throw new Error(invalidOrUnavailableMessage);

  const apiUrl = `https://api22-normal-c-alisg.tiktokv.com/aweme/v1/feed/?aweme_id=${id}&iid=7318518857994389254&device_id=7437644993508000801&channel=googleplay&app_name=musical_ly&version_code=300904&device_platform=android&device_type=Redmi%20Note%2010&version=12`;

  let attempt = 0;
  let data: TiktokApiResponse | undefined;

  while (attempt < 3) {
    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });
    const body = await response.text();

    if (body.includes('ratelimit triggered')) {
      attempt += 1;
      await delay(2000);
      continue;
    }

    data = TiktokApiResponseSchema.parse(JSON.parse(body));
    break;
  }

  if (!data) throw new Error('tiktok api ratelimit');

  const aweme = data.aweme_list?.[0];
  if (!aweme) throw new Error('No data found');

  const result: TiktokResult = {
    music: {
      id: aweme.music?.id_str || '',
      title: aweme.music?.title || '',
      author: aweme.music?.author || '',
      url: aweme.music?.play_url?.uri || '',
      duration: aweme.music?.duration || 0,
      cover: aweme.music?.cover_thumb?.url_list?.[0] || '',
      album: aweme.music?.album || '',
    },
    statistics: aweme.statistics || {},
    author: {
      id: aweme.author?.uid || '',
      username: aweme.author?.unique_id || '',
      nickname: aweme.author?.nickname || '',
      avatar: aweme.author?.avatar_thumb?.url_list?.[0] || '',
      region: aweme.author?.region || '',
    },
  };

  delete result.statistics.aweme_id;

  if (aweme.image_post_info) {
    result.image = {
      id: aweme.aweme_id || '',
      desc: aweme.desc || '',
      cover: aweme.video?.cover?.url_list?.[0] || '',
      dynamic_cover: aweme.video?.dynamic_cover?.url_list?.[0] || '',
      origin_cover: aweme.video?.origin_cover?.url_list?.[0] || '',
      image_url: aweme.image_post_info.images?.map((image: TiktokImageItem) => image.display_image?.url_list?.[0] || '') || [],
    };
  } else {
    result.video = {
      id: aweme.aweme_id || '',
      desc: aweme.desc || '',
      cover: aweme.video?.cover?.url_list?.[0] || '',
      dynamic_cover: aweme.video?.dynamic_cover?.url_list?.[0] || '',
      origin_cover: aweme.video?.origin_cover?.url_list?.[0] || '',
      download_url: aweme.video?.play_addr?.url_list?.[0] || '',
      download_url_wm: aweme.video?.download_addr?.url_list?.[0] || '',
      duration: Math.floor((aweme.video?.duration || 0) / 1000),
      size: aweme.video?.play_addr?.data_size || 0,
      wm_size: aweme.video?.download_addr?.data_size || 0,
    };
  }

  return result;
};
