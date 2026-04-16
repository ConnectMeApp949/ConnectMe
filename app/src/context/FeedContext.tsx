import React, { createContext, useContext, useState, useCallback } from 'react';

// ─── Types ──────────────────────────────────────────────

export interface FeedStory {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string | null;
  image: string;
  caption: string;
  taggedVendors: string[];
  taggedFriends: string[];
  location: string;
  createdAt: string;
}

export interface FeedComment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string | null;
  text: string;
  likes: number;
  createdAt: string;
}

export interface FeedPost {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string | null;
  images: string[];
  caption: string;
  taggedVendors: string[];
  taggedFriends: string[];
  location: string;
  likes: number;
  liked: boolean;
  bookmarked: boolean;
  comments: FeedComment[];
  createdAt: string;
}

interface FeedContextValue {
  posts: FeedPost[];
  stories: FeedStory[];
  addPost: (post: Omit<FeedPost, 'id' | 'likes' | 'liked' | 'bookmarked' | 'comments' | 'createdAt'> & { comments?: FeedComment[] }) => void;
  addStory: (story: Omit<FeedStory, 'id' | 'createdAt'>) => void;
  editPost: (id: string, updates: { caption?: string; location?: string; taggedVendors?: string[]; taggedFriends?: string[] }) => void;
  likePost: (id: string) => void;
  bookmarkPost: (id: string) => void;
  addComment: (postId: string, comment: Omit<FeedComment, 'id' | 'likes' | 'createdAt'>) => void;
  likeComment: (postId: string, commentId: string) => void;
}

const FeedContext = createContext<FeedContextValue>({
  posts: [],
  stories: [],
  addPost: () => {},
  addStory: () => {},
  editPost: () => {},
  likePost: () => {},
  bookmarkPost: () => {},
  addComment: () => {},
  likeComment: () => {},
});

// ─── Demo Data ──────────────────────────────────────────

const DEMO_POSTS: FeedPost[] = [
  {
    id: '1',
    userId: 'u1',
    userName: 'Sarah Mitchell',
    userAvatar: null,
    images: ['https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&h=800&fit=crop'],
    caption: 'Amazing wedding reception catered by @AlamoCityCatering! The food was incredible and every guest was raving about the brisket sliders. Could not recommend them more highly!',
    taggedVendors: ['AlamoCityCatering'],
    taggedFriends: ['Mike Johnson'],
    location: 'The Pearl, San Antonio',
    likes: 142,
    liked: false,
    bookmarked: false,
    comments: [
      { id: 'c1', userId: 'u2', userName: 'Mike Johnson', userAvatar: null, text: 'Best wedding food I have ever had!', likes: 8, createdAt: '2026-04-02T18:30:00Z' },
      { id: 'c2', userId: 'u3', userName: 'AlamoCityCatering', userAvatar: null, text: 'Thank you so much Sarah! It was an honor to be part of your special day.', likes: 12, createdAt: '2026-04-02T19:00:00Z' },
      { id: 'c3', userId: 'u4', userName: 'Jessica Lee', userAvatar: null, text: 'Those sliders were unreal. We need the recipe!', likes: 3, createdAt: '2026-04-02T20:15:00Z' },
    ],
    createdAt: '2026-04-02T16:00:00Z',
  },
  {
    id: '2',
    userId: 'u5',
    userName: 'David Chen',
    userAvatar: null,
    images: ['https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=800&fit=crop'],
    caption: 'DJ @DJAlamoBeats absolutely killed it at our corporate event! The dance floor was packed all night and he read the room perfectly. Already booking him for next year.',
    taggedVendors: ['DJAlamoBeats'],
    taggedFriends: [],
    location: 'Grand Hyatt, San Antonio',
    likes: 89,
    liked: false,
    bookmarked: false,
    comments: [
      { id: 'c4', userId: 'u6', userName: 'DJAlamoBeats', userAvatar: null, text: 'Thank you David! Your team knows how to party. See you next year!', likes: 15, createdAt: '2026-04-01T22:00:00Z' },
      { id: 'c5', userId: 'u7', userName: 'Rachel Adams', userAvatar: null, text: 'Can confirm, best corporate event we have ever had', likes: 4, createdAt: '2026-04-01T23:30:00Z' },
      { id: 'c6', userId: 'u8', userName: 'Tom Williams', userAvatar: null, text: 'The playlist was fire! Need that Spotify link', likes: 6, createdAt: '2026-04-02T01:00:00Z' },
    ],
    createdAt: '2026-04-01T20:00:00Z',
  },
  {
    id: '3',
    userId: 'u9',
    userName: 'Maria Garcia',
    userAvatar: null,
    images: ['https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?w=800&h=800&fit=crop'],
    caption: 'Best food truck experience with @TacoLibreSA at the company picnic! Everyone loved the street tacos and the elote was perfection. So glad we found them on ConnectMe!',
    taggedVendors: ['TacoLibreSA'],
    taggedFriends: ['Carlos Ruiz', 'Ana Flores'],
    location: 'Brackenridge Park, San Antonio',
    likes: 203,
    liked: false,
    bookmarked: false,
    comments: [
      { id: 'c7', userId: 'u10', userName: 'Carlos Ruiz', userAvatar: null, text: 'Those al pastor tacos changed my life no exaggeration', likes: 11, createdAt: '2026-03-30T15:00:00Z' },
      { id: 'c8', userId: 'u11', userName: 'TacoLibreSA', userAvatar: null, text: 'Gracias Maria! We had so much fun at the picnic. The elote is our secret weapon!', likes: 9, createdAt: '2026-03-30T16:30:00Z' },
      { id: 'c9', userId: 'u12', userName: 'Ana Flores', userAvatar: null, text: 'Already craving those tacos again. When is the next company picnic??', likes: 5, createdAt: '2026-03-30T17:00:00Z' },
    ],
    createdAt: '2026-03-30T14:00:00Z',
  },
  {
    id: '4',
    userId: 'u13',
    userName: 'James Cooper',
    userAvatar: null,
    images: ['https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&h=800&fit=crop'],
    caption: 'Huge shoutout to @BloomSA for the stunning floral arrangements at our anniversary party. Every centerpiece was a work of art and the arch was absolutely breathtaking!',
    taggedVendors: ['BloomSA'],
    taggedFriends: ['Emily Cooper'],
    location: 'River Walk, San Antonio',
    likes: 176,
    liked: false,
    bookmarked: false,
    comments: [
      { id: 'c10', userId: 'u14', userName: 'Emily Cooper', userAvatar: null, text: 'The flowers made the whole night magical. Best anniversary ever!', likes: 18, createdAt: '2026-03-28T21:00:00Z' },
      { id: 'c11', userId: 'u15', userName: 'BloomSA', userAvatar: null, text: 'Happy anniversary! It was a joy creating something special for you two.', likes: 7, createdAt: '2026-03-28T22:30:00Z' },
      { id: 'c12', userId: 'u16', userName: 'Linda Park', userAvatar: null, text: 'That arch is STUNNING. Saving this for inspo!', likes: 4, createdAt: '2026-03-29T08:00:00Z' },
    ],
    createdAt: '2026-03-28T19:00:00Z',
  },
  {
    id: '5',
    userId: 'u17',
    userName: 'Ashley Thompson',
    userAvatar: null,
    images: ['https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=800&fit=crop'],
    caption: '@SAPhotoStudio captured our baby shower so beautifully! Every candid moment was pure gold. Now I have the most amazing memories to look back on forever.',
    taggedVendors: ['SAPhotoStudio'],
    taggedFriends: ['Nicole Brown', 'Katie Wilson'],
    location: 'Botanical Garden, San Antonio',
    likes: 231,
    liked: false,
    bookmarked: false,
    comments: [
      { id: 'c13', userId: 'u18', userName: 'Nicole Brown', userAvatar: null, text: 'The photos are incredible! You look gorgeous in every single one', likes: 14, createdAt: '2026-03-25T13:00:00Z' },
      { id: 'c14', userId: 'u19', userName: 'SAPhotoStudio', userAvatar: null, text: 'Thank you Ashley! Your shower was so beautiful, it was easy to capture magic.', likes: 10, createdAt: '2026-03-25T14:30:00Z' },
      { id: 'c15', userId: 'u20', userName: 'Katie Wilson', userAvatar: null, text: 'Best baby shower ever and the photos prove it!', likes: 6, createdAt: '2026-03-25T16:00:00Z' },
    ],
    createdAt: '2026-03-25T12:00:00Z',
  },
  {
    id: '6',
    userId: 'u21',
    userName: 'Marcus Rivera',
    userAvatar: null,
    images: ['https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=800&h=800&fit=crop'],
    caption: 'Threw a surprise birthday bash and @EventVibesSA handled everything from decor to coordination. Stress-free planning and an unforgettable night. Five stars across the board!',
    taggedVendors: ['EventVibesSA'],
    taggedFriends: ['Derek Hall'],
    location: 'La Villita, San Antonio',
    likes: 118,
    liked: false,
    bookmarked: false,
    comments: [
      { id: 'c16', userId: 'u22', userName: 'Derek Hall', userAvatar: null, text: 'I was so surprised! Marcus you really outdid yourself (with some help haha)', likes: 9, createdAt: '2026-03-22T23:00:00Z' },
      { id: 'c17', userId: 'u23', userName: 'EventVibesSA', userAvatar: null, text: 'The look on Derek\'s face was priceless! Thank you for trusting us with the surprise.', likes: 13, createdAt: '2026-03-23T00:30:00Z' },
      { id: 'c18', userId: 'u24', userName: 'Lisa Martinez', userAvatar: null, text: 'The decorations were unreal! How do I book them for my party?', likes: 3, createdAt: '2026-03-23T10:00:00Z' },
    ],
    createdAt: '2026-03-22T21:00:00Z',
  },
];

// ─── Provider ───────────────────────────────────────────

const DEMO_STORIES: FeedStory[] = [
  { id: 'ds1', userId: 'u1', userName: 'Sarah M.', userAvatar: null, image: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&h=1200&fit=crop', caption: 'Wedding prep day!', taggedVendors: ['AlamoCityCatering'], taggedFriends: [], location: 'The Pearl, San Antonio', createdAt: '2026-04-15T08:00:00Z' },
  { id: 'ds2', userId: 'u5', userName: 'David C.', userAvatar: null, image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=1200&fit=crop', caption: 'Event night vibes', taggedVendors: ['DJAlamoBeats'], taggedFriends: [], location: 'Grand Hyatt, San Antonio', createdAt: '2026-04-15T06:00:00Z' },
  { id: 'ds3', userId: 'u9', userName: 'Maria G.', userAvatar: null, image: 'https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?w=800&h=1200&fit=crop', caption: 'Taco Tuesday!', taggedVendors: ['TacoLibreSA'], taggedFriends: ['Carlos Ruiz'], location: 'Brackenridge Park', createdAt: '2026-04-15T04:00:00Z' },
  { id: 'ds4', userId: 'u13', userName: 'James C.', userAvatar: null, image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&h=1200&fit=crop', caption: 'Flowers everywhere', taggedVendors: ['BloomSA'], taggedFriends: ['Emily Cooper'], location: 'River Walk', createdAt: '2026-04-15T02:00:00Z' },
  { id: 'ds5', userId: 'u17', userName: 'Ashley T.', userAvatar: null, image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=1200&fit=crop', caption: 'Best day ever', taggedVendors: [], taggedFriends: ['Nicole Brown'], location: 'Botanical Garden', createdAt: '2026-04-14T22:00:00Z' },
  { id: 'ds6', userId: 'u21', userName: 'Marcus R.', userAvatar: null, image: 'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=800&h=1200&fit=crop', caption: 'Surprise party setup', taggedVendors: ['EventVibesSA'], taggedFriends: ['Derek Hall'], location: 'La Villita', createdAt: '2026-04-14T20:00:00Z' },
];

export function FeedProvider({ children }: { children: React.ReactNode }) {
  const [posts, setPosts] = useState<FeedPost[]>(DEMO_POSTS);
  const [stories, setStories] = useState<FeedStory[]>(DEMO_STORIES);

  const addStory = useCallback((data: Omit<FeedStory, 'id' | 'createdAt'>) => {
    const newStory: FeedStory = {
      ...data,
      id: `story_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setStories((prev) => [newStory, ...prev]);
  }, []);

  const addPost = useCallback((data: Omit<FeedPost, 'id' | 'likes' | 'liked' | 'bookmarked' | 'comments' | 'createdAt'> & { comments?: FeedComment[] }) => {
    const newPost: FeedPost = {
      ...data,
      id: `post_${Date.now()}`,
      likes: 0,
      liked: false,
      bookmarked: false,
      comments: data.comments ?? [],
      createdAt: new Date().toISOString(),
    };
    setPosts((prev) => [newPost, ...prev]);
  }, []);

  const editPost = useCallback((id: string, updates: { caption?: string; location?: string; taggedVendors?: string[]; taggedFriends?: string[] }) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, ...updates } : p,
      ),
    );
  }, []);

  const likePost = useCallback((id: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
          : p,
      ),
    );
  }, []);

  const bookmarkPost = useCallback((id: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, bookmarked: !p.bookmarked } : p,
      ),
    );
  }, []);

  const addComment = useCallback((postId: string, comment: Omit<FeedComment, 'id' | 'likes' | 'createdAt'>) => {
    const newComment: FeedComment = {
      ...comment,
      id: `comment_${Date.now()}`,
      likes: 0,
      createdAt: new Date().toISOString(),
    };
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, comments: [...p.comments, newComment] } : p,
      ),
    );
  }, []);

  const likeComment = useCallback((postId: string, commentId: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              comments: p.comments.map((c) =>
                c.id === commentId ? { ...c, likes: c.likes + 1 } : c,
              ),
            }
          : p,
      ),
    );
  }, []);

  return (
    <FeedContext.Provider value={{ posts, stories, addPost, addStory, editPost, likePost, bookmarkPost, addComment, likeComment }}>
      {children}
    </FeedContext.Provider>
  );
}

export function useFeed() {
  return useContext(FeedContext);
}
