export type Game = { slug: string; title: string; genre: string; platform: string; description: string; visual: string; status?: string; imageUrl?: string; videoUrl?: string; downloadUrl?: string };
export type NewsItem = { slug: string; category: string; date: string; title: string; description: string; body?: string; visual: string };
export type Job = { id: string; title: string; team: string; location: string; description: string; apply_url?: string | null; published?: boolean; created_at?: string };
export type Profile = {
  id: string;
  email?: string | null;
  username: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  country?: string | null;
  ifgt_id: string;
  role: "player" | "developer" | "moderator" | "admin";
  created_at: string;
};
