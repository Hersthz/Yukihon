import apiClient from "@/lib/apiClient";
import type { StoryModeStory } from "@/data/storyMode";

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
    const stories = await apiClient.request<StoryModeAdminStory[]>("/api/story-mode/stories");
    return stories.map(toClientStory);
  },
  admin: {
    getStories: () => apiClient.request<StoryModeAdminStory[]>("/api/admin/story-mode/stories"),
    getStory: (id: number) =>
      apiClient.request<StoryModeAdminStory>(`/api/admin/story-mode/stories/${id}`),
    createStory: (story: StoryModeAdminStory) =>
      apiClient.request<StoryModeAdminStory>("/api/admin/story-mode/stories", {
        method: "POST",
        body: JSON.stringify(story),
      }),
    updateStory: (id: number, story: StoryModeAdminStory) =>
      apiClient.request<StoryModeAdminStory>(`/api/admin/story-mode/stories/${id}`, {
        method: "PUT",
        body: JSON.stringify(story),
      }),
    deleteStory: (id: number) =>
      apiClient.request<void>(`/api/admin/story-mode/stories/${id}`, {
        method: "DELETE",
      }),
  },
};
