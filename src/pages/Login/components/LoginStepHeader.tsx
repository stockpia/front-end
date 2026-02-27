type LoginStepHeaderProps = {
  currentStep: number;
  totalSteps: number;
};

const STEP_LABELS = ["기본 정보", "계좌 정보"];

export default function LoginStepHeader({
  currentStep,
  totalSteps,
}: LoginStepHeaderProps) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <header>
      <h1 className="text-3xl font-bold">한국투자증권 계좌 연동</h1>
      <div className="mt-4 h-2 w-full rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div
        className="mt-4 grid gap-2"
        style={{ gridTemplateColumns: `repeat(${STEP_LABELS.length}, minmax(0, 1fr))` }}>
        {STEP_LABELS.map((label, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isDone = stepNumber < currentStep;

          return (
            <div key={label} className="flex items-center gap-2">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold ${
                  isActive || isDone
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}>
                {stepNumber}
              </div>
              <span
                className={`text-sm ${
                  isActive
                    ? "font-semibold text-foreground"
                    : "text-muted-foreground"
                }`}>
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </header>
  );
}
