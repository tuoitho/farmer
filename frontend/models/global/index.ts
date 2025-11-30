import { ReactNode } from 'react';
import { PublicConfiguration } from 'swr/_internal';

type TParams = string | string[][] | Record<string, string> | URLSearchParams | undefined;

type TPromiseParams = {
  params: Promise<{
    lang: string;
    slug: string;
    type: string;
    id: string;
    category: string;
  }>;
};

type TSessionResponse = {
  session_id: string;
  sub_session_id: string;
};

type TResponseData<T = unknown> = {
  data?: T;
  meta?: TMeta;
  message?: string;
  status?: string;
  status_code?: number;
  error?: {
    errors: {
      msg: string;
    };
  };
};

type TAuthData = {
  partner_id: number;
  token: string;
  user_id: number;
  user_type: string;
  password?: string;
};

type TMeta = {
  pagination: {
    count?: number;
    current_page?: number;
    per_page?: number;
    total: number;
    total_pages: number;
  };
};

type TPromiseResponse<T = unknown> = Promise<TResponseData<T>>;

type TLayoutProps<T extends Record<string, string> = TDefaultParams> = {
  children: React.ReactNode;
  params: T;
  searchParams: { [key: string]: string | string[] | undefined };
};

type TDefaultParams = {
  lang: string;
  category: string;
  type: string;
  slug: string;
  code: string;
  id: string;
};

type TFetchHeaders = {
  cache: RequestCache;
  next: { revalidate: number; tags: string[] };
  headers: {
    'Content-Type': string;
    Authorization: string;
    'x-api-key': string;
  };
};

type TOptionHook<Data = unknown> = {
  params?: TParams;
  isFetch?: boolean;
  config?: Partial<PublicConfiguration<Data | undefined, unknown, any>>;
  onSuccess?: (response: { data: Data; meta?: TMeta }) => void;
  onError?: (error: unknown) => void;
};

type TOptionFetchDataHook<Data = unknown> = TOptionHook<Data> & {
  key: string;
};

type TArgMutate<T = unknown> = {
  arg: T;
};

type TOption<T = unknown> = {
  value: string;
  label: ReactNode;
  disabled?: boolean;
  data?: T;
};

export type {
  TParams,
  TOption,
  TSessionResponse,
  TResponseData,
  TAuthData,
  TMeta,
  TPromiseResponse,
  TLayoutProps,
  TFetchHeaders,
  TOptionHook,
  TOptionFetchDataHook,
  TArgMutate,
  TPromiseParams,
};
