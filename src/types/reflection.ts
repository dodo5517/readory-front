export interface Cluster {
  theme: string;
  summary: string;
  indices: number[];
  thin: boolean;
}

export interface ReflectionSection {
  heading: string;
  body: string;
}

export interface ReflectionDraft {
  title: string;
  tone: string;
  sections: ReflectionSection[];
}
