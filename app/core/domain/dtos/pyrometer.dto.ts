export interface PyrometerDto {
  readonly id: string;
  /** Nome curto que vem do aparelho. */
  readonly name: string | null;
  readonly nickname: string | null;
  readonly color: string;
  readonly note: string | null;
  readonly active: boolean;
}
