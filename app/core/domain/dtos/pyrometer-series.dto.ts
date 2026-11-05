export interface SeriesPointDto {
  readonly measuredAt: string;
  readonly temperature: number;
}

export interface PyrometerSeriesDto {
  readonly pyrometerId: string | null;
  readonly pyrometerName: string | null;
  readonly points: readonly SeriesPointDto[];
}
