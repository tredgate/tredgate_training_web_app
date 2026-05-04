import { useState } from "react";
import type { JSX } from "react";
import { Check } from "lucide-react";

export type WizardAction = "next" | "back" | "cancel" | "submit";

export interface WizardStep {
  label: string;
  content: React.ReactNode;
  validate?: () => boolean;
}

export interface WizardProps {
  steps: WizardStep[];
  onComplete: () => void;
  onCancel: () => void;
  testIdPrefix: string;
  className?: string;
}

export default function Wizard({
  steps,
  onComplete,
  onCancel,
  testIdPrefix,
  className = "",
}: WizardProps): JSX.Element {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    const step = steps[currentStep];
    if (step?.validate && !step.validate()) {
      return;
    }
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isLastStep = currentStep === steps.length - 1;

  return (
    <div
      data-testid={`${testIdPrefix}-wizard`}
      className={`glass ${className}`}
    >
      {/* Step Indicator */}
      <div
        data-testid={`${testIdPrefix}-wizard-step-indicator`}
        className="px-6 py-4 border-b border-white/10"
      >
        <div className="flex items-center justify-between">
          {steps.map((step, i) => {
            const isCompleted = i < currentStep;
            const isCurrent = i === currentStep;

            return (
              <div key={i} className="flex items-center flex-1">
                <div
                  data-testid={`${testIdPrefix}-wizard-step-${i + 1}`}
                  className="flex items-center gap-2"
                >
                  <span
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                      isCompleted
                        ? "bg-neon-purple/80 text-white"
                        : isCurrent
                          ? "bg-white/10 text-white border-2 border-neon-purple"
                          : "bg-white/5 text-gray-500"
                    }`}
                  >
                    {isCompleted ? <Check className="w-5 h-5" /> : i + 1}
                  </span>
                  <span
                    className={`text-sm font-medium hidden sm:inline ${
                      isCurrent || isCompleted ? "text-white" : "text-gray-500"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={`flex-1 h-px mx-3 ${
                      isCompleted ? "bg-neon-purple/80" : "bg-white/10"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div data-testid={`${testIdPrefix}-wizard-content`} className="p-6">
        {steps[currentStep]?.content}
      </div>

      {/* Footer / Actions */}
      <div className="flex justify-between items-center px-6 py-4 border-t border-white/10">
        <button
          data-testid={`${testIdPrefix}-wizard-btn-cancel`}
          onClick={onCancel}
          className="btn-ghost"
        >
          Cancel
        </button>
        <div className="flex gap-3">
          {currentStep > 0 && (
            <button
              data-testid={`${testIdPrefix}-wizard-btn-back`}
              onClick={handleBack}
              className="btn-ghost"
            >
              Back
            </button>
          )}
          <button
            data-testid={
              isLastStep
                ? `${testIdPrefix}-wizard-btn-submit`
                : `${testIdPrefix}-wizard-btn-next`
            }
            onClick={handleNext}
            className="btn-neon-purple"
          >
            {isLastStep ? "Submit" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
