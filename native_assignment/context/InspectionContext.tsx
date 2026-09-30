// native_assignment/context/InspectionContext.tsx
import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { Inspection, Category, RiskLevel } from '../types/inspection';

export interface InspectionDraft {
  vendorAlias: string;
  stallCode: string;
  category: Category | null;
  contactNumber: string;
  riskLevel: RiskLevel | null;
  consent: boolean;
  imageUri: string | null;
}

const EMPTY_DRAFT: InspectionDraft = {
  vendorAlias: '',
  stallCode: '',
  category: null,
  contactNumber: '',
  riskLevel: null,
  consent: false,
  imageUri: null,
};

interface InspectionContextType {
  records: Inspection[];
  addInspection: (inspection: Inspection) => void;
  getInspectionById: (id: string) => Inspection | undefined;
  draft: InspectionDraft;
  updateDraft: (partial: Partial<InspectionDraft>) => void;
  resetDraft: () => void;
}

const InspectionContext = createContext<InspectionContextType | undefined>(undefined);

export function InspectionProvider({ children }: { children: ReactNode }) {
  const [records, setRecords] = useState<Inspection[]>([]);
  const [draft, setDraft] = useState<InspectionDraft>(EMPTY_DRAFT);

  // useCallback prevents these functions from changing reference on every render
  const addInspection = useCallback((inspection: Inspection) => {
    setRecords((prev) => [inspection, ...prev]);
  }, []);

  const getInspectionById = useCallback((id: string) => {
    return records.find((record) => record.id === id);
  }, [records]);

  const updateDraft = useCallback((partial: Partial<InspectionDraft>) => {
    setDraft((prev) => ({ ...prev, ...partial }));
  }, []);

  const resetDraft = useCallback(() => {
    setDraft(EMPTY_DRAFT);
  }, []);

  return (
    <InspectionContext.Provider
      value={{
        records,
        addInspection,
        getInspectionById,
        draft,
        updateDraft,
        resetDraft,
      }}
    >
      {children}
    </InspectionContext.Provider>
  );
}

export function useInspections() {
  const context = useContext(InspectionContext);
  if (!context) {
    throw new Error('useInspections must be used within an InspectionProvider');
  }
  return context;
}