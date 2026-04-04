import { useState } from "react";
import GrammarEditorForm from "./GrammarEditorForm";
import LessonEditorForm from "./LessonEditorForm";
import QuizEditorForm from "./QuizEditorForm";
import VocabularyEditorForm from "./VocabularyEditorForm";
import { AdminTab, EditableItem, GrammarItem, Lesson, LessonVersion, MediaUploadResult, QuizItem, VocabItem } from "./types";

interface AdminContentFormProps {
  activeTab: AdminTab;
  editItem: EditableItem | null;
  setEditItem: (item: EditableItem) => void;
  lessonVersions: LessonVersion[];
  contentOptions: {
    lessons: Lesson[];
    vocabulary: VocabItem[];
    grammar: GrammarItem[];
    quizzes: QuizItem[];
  };
  uploadMedia: (file: File) => Promise<MediaUploadResult>;
  onRestoreLessonVersion: (version: LessonVersion) => void;
}

const AdminContentForm = ({
  activeTab,
  editItem,
  setEditItem,
  lessonVersions,
  contentOptions,
  uploadMedia,
  onRestoreLessonVersion,
}: AdminContentFormProps) => {
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  if (!editItem) {
    return null;
  }

  const uploadToField = async (field: string, file: File) => {
    try {
      setUploadingField(field);
      const response = await uploadMedia(file);
      const updatedItem = { ...editItem, [field]: response.url };
      setEditItem(updatedItem as unknown as EditableItem);
    } finally {
      setUploadingField(null);
    }
  };

  switch (activeTab) {
    case "lessons":
      return (
        <LessonEditorForm
          item={editItem as Lesson}
          lessonVersions={lessonVersions}
          contentOptions={{
            vocabulary: contentOptions.vocabulary,
            grammar: contentOptions.grammar,
            quizzes: contentOptions.quizzes,
          }}
          uploadingField={uploadingField}
          onChange={(item) => setEditItem(item)}
          onUploadMedia={uploadToField}
          onRestoreLessonVersion={onRestoreLessonVersion}
        />
      );
    case "vocabulary":
      return <VocabularyEditorForm item={editItem as VocabItem} onChange={(item) => setEditItem(item)} />;
    case "grammar":
      return <GrammarEditorForm item={editItem as GrammarItem} onChange={(item) => setEditItem(item)} />;
    case "quizzes":
      return (
        <QuizEditorForm
          item={editItem as QuizItem}
          lessons={contentOptions.lessons}
          uploadingField={uploadingField}
          onChange={(item) => setEditItem(item)}
          onUploadMedia={uploadToField}
        />
      );
    default:
      return null;
  }
};

export default AdminContentForm;
