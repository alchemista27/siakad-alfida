type ObservationResultLike = {
  id: string;
  score: number | { toString(): string };
  createdAt: Date;
};

type RegistrationWithResult<T extends ObservationResultLike> = {
  observationResult: T | null;
};

export function rankObservationResults<
  TResult extends ObservationResultLike,
  TRegistration extends RegistrationWithResult<TResult>,
>(registrations: TRegistration[]): Array<{ registration: TRegistration & { observationResult: TResult }; rank: number }> {
  return registrations
    .filter((registration): registration is TRegistration & { observationResult: TResult } => registration.observationResult !== null)
    .sort((left, right) => {
      const scoreDifference = Number(right.observationResult.score) - Number(left.observationResult.score);
      if (scoreDifference !== 0) return scoreDifference;

      const createdAtDifference = left.observationResult.createdAt.getTime() - right.observationResult.createdAt.getTime();
      if (createdAtDifference !== 0) return createdAtDifference;

      return left.observationResult.id.localeCompare(right.observationResult.id);
    })
    .map((registration, index) => ({ registration, rank: index + 1 }));
}
