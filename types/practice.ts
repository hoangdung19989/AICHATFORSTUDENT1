export interface PracticeLesson {
  id: string;
  title: string;
}

export interface PracticeChapter {
  id: string;
  title: string;
  lessons: PracticeLesson[];
}
