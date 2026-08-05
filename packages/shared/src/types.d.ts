/** Row shapes shared by the site, the admin panel and the tests. */

export type Medicine = {
  id: number;
  s_no: number;
  medicine_name: string;
  selling_price: number;
  pack_size: string;
  mrp: number;
};

export type RateTest = {
  id: number;
  sl_no: number;
  test_name: string;
  jm_rate: number | string;
  vail_name: string;
};

export type CampPost = {
  id: string;
  title: string;
  description: string;
  camp_date: string;
  venue: string;
  address: string;
  fee: string;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
};

export type BulletinKind = "info" | "offer";

export type Bulletin = {
  id: string;
  kind: BulletinKind;
  body: string;
  pinned: boolean;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
};
