export const TEXT_KEYS = {
  appName: 'appName',
  sidebarLabel: 'sidebarLabel',
  navigationLabel: 'navigationLabel',
  homeTitle: 'homeTitle',
  homeDescription: 'homeDescription',
  statusTitle: 'statusTitle',
  statusChecking: 'statusChecking',
  serviceApi: 'serviceApi',
  serviceDatabase: 'serviceDatabase',
  stateUp: 'stateUp',
  stateDown: 'stateDown',
  stateUnknown: 'stateUnknown',
} as const;

export type TextKey = (typeof TEXT_KEYS)[keyof typeof TEXT_KEYS];
