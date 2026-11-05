export interface PyrometerSummaryDto {
  readonly pyrometerId: string;
  readonly temperature: number;
  readonly measuredAt: string;
  readonly battery: number | null;
  readonly minutesWithoutReading: number;
}
