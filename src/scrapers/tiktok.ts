export type TiktokImageItem = {
  display_image?: {
    url_list?: string[];
  };
};

export type TiktokAweme = {
  music?: {
    id_str?: string;
    title?: string;
    author?: string;
    play_url?: {
      uri?: string;
    };
    duration?: number;
    cover_thumb?: {
      url_list?: string[];
    };
    album?: string;
  };
  statistics?: Record<string, number> & {
    aweme_id?: number;
  };
  author?: {
    uid?: string;
    unique_id?: string;
    nickname?: string;
    avatar_thumb?: {
      url_list?: string[];
    };
    region?: string;
  };
  image_post_info?: {
    images?: TiktokImageItem[];
  };
  aweme_id?: string;
  desc?: string;
  video?: {
    cover?: {
      url_list?: string[];
    };
    dynamic_cover?: {
      url_list?: string[];
    };
    origin_cover?: {
      url_list?: string[];
    };
    play_addr?: {
      url_list?: string[];
      data_size?: number;
    };
    download_addr?: {
      url_list?: string[];
      data_size?: number;
    };
    duration?: number;
  };
};

export type TiktokApiResponse = {
  aweme_list?: TiktokAweme[];
};

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
  if (!isVideo && !isPhoto) throw new Error('Video or Photo not found');

  const marker = isVideo ? '/video/' : '/photo/';
  const id = url.substring(url.indexOf(marker) + marker.length, url.indexOf(marker) + 26).split('?')[0];
  if (!id) throw new Error('Video or Photo not found');

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

    data = JSON.parse(body) as TiktokApiResponse;
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