import { useState } from "react";
import LoginStepHeader from "./components/LoginStepHeader";
import AccountInfoStep from "./views/AccountInfoStep";
import BasicInfoStep from "./views/BasicInfoStep";
import VerificationStep from "./views/VerificationStep";

const TOTAL_STEPS = 3;

export default function Login() {
	const [currentStep, setCurrentStep] = useState(1);

	const goNext = () => {
		setCurrentStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
	};

	const goPrev = () => {
		setCurrentStep((prev) => Math.max(prev - 1, 1));
	};

	const renderStepView = () => {
		if (currentStep === 1) {
			return <BasicInfoStep onNext={goNext} />;
		}

		if (currentStep === 2) {
			return <AccountInfoStep onNext={goNext} onPrev={goPrev} />;
		}

		return <VerificationStep onPrev={goPrev} />;
	};

	return (
		<div className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-6 py-10">
			<LoginStepHeader currentStep={currentStep} totalSteps={TOTAL_STEPS} />
			<div className="mt-8">{renderStepView()}</div>
		</div>
	);
}
