import apiClient from "@/lib/apiClient";
import type { StoryModeStory } from "@/data/storyMode";

// Story Mode has a rich client-side editing model (@/data/storyMode) that the wire
// DTO (StoryModeStoryDto) doesn't fully capture, so this type stays hand-written.
export interface StoryModeAdminStory extends Omit<StoryModeStory, "id"> {
  id?: number;
  storyKey: string;
  published: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const toClientStory = (story: StoryModeAdminStory): StoryModeStory => ({
  id: story.storyKey || story.id?.toString() || story.title,
  title: story.title,
  subtitle: story.subtitle,
  description: story.description,
  jlptLevel: story.jlptLevel,
  estimatedMinutes: story.estimatedMinutes,
  tone: story.tone,
  coverLabel: story.coverLabel,
  entrySegmentId: story.entrySegmentId,
  segments: story.segments ?? [],
});

export const storyModeApi = {
  getPublishedStories: async () => {
    const stories = await apiClient.get<StoryModeAdminStory[]>("/api/story-mode/stories");
    return stories.map(toClientStory);
  },
  admin: {
    getStories: () => apiClient.get<StoryModeAdminStory[]>("/api/admin/story-mode/stories"),
    getStory: (id: number) =>
      apiClient.get<StoryModeAdminStory>(`/api/admin/story-mode/stories/${id}`),
    createStory: (story: StoryModeAdminStory) =>
      apiClient.post<StoryModeAdminStory>("/api/admin/story-mode/stories", story),
    updateStory: (id: number, story: StoryModeAdminStory) =>
      apiClient.put<StoryModeAdminStory>(`/api/admin/story-mode/stories/${id}`, story),
    deleteStory: (id: number) => apiClient.del<void>(`/api/admin/story-mode/stories/${id}`),
  },
};
