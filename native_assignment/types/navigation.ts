// native_assignment/types/navigation.ts

// 1. Root Stack (AppNavigator)
export type RootStackParamList = {
  Splash: undefined;
  Main: undefined;
};

// 2. New Inspection Stack (Handles Form -> Evidence -> Review -> Success)
export type NewInspectionStackParamList = {
  NewInspectionForm: undefined;
  AddEvidence: undefined;
  ReviewInspection: undefined;
  SaveSuccess: undefined;
};

// 3. Bottom Tabs (MainTabNavigator)
export type MainTabParamList = {
  Home: undefined;
  NewInspection: undefined; // This will render the NewInspectionStackNavigator
  Records: undefined;
};

// 4. Records Stack (RecordsStackNavigator)
export type RecordsStackParamList = {
  RecordsList: undefined;
  InspectionDetails: { inspectionId: string };
};