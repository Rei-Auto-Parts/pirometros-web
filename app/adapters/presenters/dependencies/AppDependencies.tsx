import { createContext, type ReactNode, useContext } from 'react';
import type { IGetHealthUseCase } from '../../../interfaces/core/application/i-get-health.use-case';
import type { IGetReadingsSeriesUseCase } from '../../../interfaces/core/application/i-get-readings-series.use-case';
import type { IListPyrometerSummariesUseCase } from '../../../interfaces/core/application/i-list-pyrometer-summaries.use-case';
import type { IListPyrometersUseCase } from '../../../interfaces/core/application/i-list-pyrometers.use-case';
import type { IListReadingsUseCase } from '../../../interfaces/core/application/i-list-readings.use-case';
import type { ISavePyrometerProfileUseCase } from '../../../interfaces/core/application/i-save-pyrometer-profile.use-case';

export interface AppDependencies {
  readonly getHealthUseCase: IGetHealthUseCase;
  readonly listReadingsUseCase: IListReadingsUseCase;
  readonly getReadingsSeriesUseCase: IGetReadingsSeriesUseCase;
  readonly listPyrometersUseCase: IListPyrometersUseCase;
  readonly listPyrometerSummariesUseCase: IListPyrometerSummariesUseCase;
  readonly savePyrometerProfileUseCase: ISavePyrometerProfileUseCase;
}

const AppDependenciesContext = createContext<AppDependencies | null>(null);

interface AppDependenciesProviderProps {
  readonly dependencies: AppDependencies;
  readonly children: ReactNode;
}

export function AppDependenciesProvider({ dependencies, children }: AppDependenciesProviderProps) {
  return (
    <AppDependenciesContext.Provider value={dependencies}>
      {children}
    </AppDependenciesContext.Provider>
  );
}

export function useDependencies(): AppDependencies {
  const dependencies = useContext(AppDependenciesContext);
  if (dependencies === null) {
    throw new Error('useDependencies fora do AppDependenciesProvider');
  }
  return dependencies;
}
