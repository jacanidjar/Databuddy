import { create } from 'zustand';

interface OnboardingState {
  domainSet: boolean;
  websiteAdded: boolean;
  trackerSet: boolean;
  setDomainSet: (value: boolean) => void;
  setWebsiteAdded: (value: boolean) => void;
  setTrackerSet: (value: boolean) => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  domainSet: false,
  websiteAdded: false,
  trackerSet: false,
  setDomainSet: (value) => set({ domainSet: value }),
  setWebsiteAdded: (value) => set({ websiteAdded: value }),
  setTrackerSet: (value) => set({ trackerSet: value }),
  reset: () => set({ domainSet: false, websiteAdded: false, trackerSet: false }),
})); 