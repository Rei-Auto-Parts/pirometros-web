export interface ReadingDto {
  readonly id: number;
  readonly measuredAt: string | null;
  readonly pyrometerId: string | null;
  readonly pyrometerName: string | null;
  readonly temperature: number | null;
  readonly unit: string | null;
  readonly battery: number | null;
  readonly place: number | null;
}
