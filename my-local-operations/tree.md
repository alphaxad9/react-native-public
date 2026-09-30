MOB_A1_GXX/
│
├── App.tsx
├── package.json
├── app.json
├── tsconfig.json
│
├── assets/
│   ├── icon.png
│   ├── splash.png
│   └── market-placeholder.png
│
└── native_assignment/
    │
    ├── navigation/
    │   ├── AppNavigator.tsx
    │   ├── MainTabNavigator.tsx
    │   └── RecordsStackNavigator.tsx
    │
    ├── screens/
    │   ├── SplashScreen.tsx
    │   ├── HomeScreen.tsx
    │   ├── NewInspectionScreen.tsx
    │   ├── AddEvidenceScreen.tsx
    │   ├── ReviewInspectionScreen.tsx
    │   ├── SaveSuccessScreen.tsx
    │   ├── RecordsScreen.tsx
    │   └── InspectionDetailsScreen.tsx
    │
    ├── components/
    │   ├── AppHeader.tsx
    │   ├── BottomTabBar.tsx
    │   ├── MarketCard.tsx
    │   ├── EmptyState.tsx
    │   ├── StatusChip.tsx
    │   ├── PriorityBadge.tsx
    │   ├── FormInput.tsx
    │   ├── FormSelect.tsx
    │   ├── RiskSelector.tsx
    │   ├── ConsentCheckbox.tsx
    │   ├── ValidationMessage.tsx
    │   ├── EvidencePreview.tsx
    │   ├── EvidenceActionButtons.tsx
    │   ├── InspectionSummary.tsx
    │   └── RecordCard.tsx
    │
    ├── context/
    │   └── InspectionContext.tsx
    │
    ├── types/
    │   ├── navigation.ts
    │   ├── inspection.ts
    │   └── market.ts
    │
    ├── data/
    │   └── marketZones.ts
    │
    ├── validation/
    │   └── inspectionValidation.ts
    │
    ├── services/
    │   └── mediaService.ts
    │
    ├── constants/
    │   ├── groupConfig.ts
    │   ├── colors.ts
    │   └── inspectionOptions.ts
    │
    └── utils/
        ├── date.ts
        └── id.ts