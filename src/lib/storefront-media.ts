export type StorefrontMedia = {
  id: string;
  image: string;
  title: string;
  detail: string;
  alt: string;
  href: string;
  wide?: boolean;
  galleryOrder?: number;
  carouselOrder?: number;
  published: boolean;
  generated?: boolean;
};
