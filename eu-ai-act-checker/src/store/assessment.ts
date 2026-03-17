import { create } from "zustand";
import type { AssessmentRequest, AssessmentResult } from "@workspace/api-client-react";

interface AssessmentState {
  request: AssessmentRequest | null;
  result: AssessmentResult | null;
  explanation: string | null;
  setRequest: (req: AssessmentRequest) => void;
  setResult: (res: AssessmentResult) => void;
  setExplanation: (exp: string) => void;
  reset: () => void;
}

export const useAssessmentStore = create<AssessmentState>((set) => ({
  request: null,
  result: null,
  explanation: null,
  setRequest: (req) => set({ request: req }),
  setResult: (res) => set({ result: res, explanation: null }),
  setExplanation: (exp) => set({ explanation: exp }),
  reset: () => set({ request: null, result: null, explanation: null }),
}));
