export type Profile = {
  name: string;
  email: string;
  full_name: string;
  avatar_url: string;
  updated_at: string;
};

export type ExtensionJwtPayload = {
  exp: number;
  sub: string;
  scope: string;
  iat: number;
};
