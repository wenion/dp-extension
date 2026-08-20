type TextRun = {
  content: string;
};

type ParagraphElement = {
  startIndex: number;
  endIndex: number;

  textRun?: TextRun;
};

type Paragraph = {
  elements: ParagraphElement[];
};

type StructuralElement = {
  startIndex: number;
  endIndex: number;
  paragraph?: Paragraph;
};

export type GoogleDocType = {
  documentId: string;
  body: {
    content: StructuralElement[];
  };
};

export type DocState = {
  preState?: string;
  state: string;
  letter?: string;
  startPosition: number;
  endPosition?: number;
  piece?: string;
  lastUpdated: number; // timestamp (e.g., Date.now())
  requestId: number;
  index: number;
  acc: number;
  type: string;
  docId: string;
};
