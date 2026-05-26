import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import LoginStepHeader from "./components/LoginStepHeader";
import AccountInfoStep from "./views/AccountInfoStep";
import BasicInfoStep from "./views/BasicInfoStep";
import NotificationInfoStep from "./views/NotificationInfoStep";
import SigninStep from "./views/SigninStep";
import type { AccountEnvironment } from "@/types/accounts";

const TOTAL_STEPS = 3;

export default function Login() {
	const [searchParams] = useSearchParams();
	const initialMode =
		searchParams.get("mode") === "signup" ? "signup" : "signin";
	const [mode, setMode] = useState<"signup" | "signin">(initialMode);
	const [currentStep, setCurrentStep] = useState(1);
	const [name, setName] = useState("");
	const [birthDate, setBirthDate] = useState("");
	const [phoneNumber, setPhoneNumber] = useState("");
	const [password, setPassword] = useState("");
	const [accountNumber, setAccountNumber] = useState("");
	const [appKey, setAppKey] = useState("");
	const [appSecretKey, setAppSecretKey] = useState("");
	const [environment, setEnvironment] = useState<AccountEnvironment>("vps");

	const goNext = () => {
		setCurrentStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
	};

	const goPrev = () => {
		setCurrentStep((prev) => Math.max(prev - 1, 1));
	};

	const renderStepView = () => {
		if (mode === "signin") {
			return <SigninStep />;
		}

		if (currentStep === 1) {
			return (
				<BasicInfoStep
					name={name}
					birthDate={birthDate}
					phoneNumber={phoneNumber}
					password={password}
					onChangeName={setName}
					onChangeBirthDate={setBirthDate}
					onChangePhoneNumber={setPhoneNumber}
					onChangePassword={setPassword}
					onNext={goNext}
				/>
			);
		}

		if (currentStep === 2) {
			return (
				<AccountInfoStep
					accountNumber={accountNumber}
					appKey={appKey}
					appSecretKey={appSecretKey}
					environment={environment}
					onChangeAccountNumber={setAccountNumber}
					onChangeAppKey={setAppKey}
					onChangeAppSecretKey={setAppSecretKey}
					onChangeEnvironment={setEnvironment}
					onPrev={goPrev}
					onNext={goNext}
				/>
			);
		}

		return (
			<NotificationInfoStep
				name={name}
				birthDate={birthDate}
				phoneNumber={phoneNumber}
				password={password}
				accountNumber={accountNumber}
				onPrev={goPrev}
			/>
		);
	};

	return (
		<div className="mx-auto flex min-h-screen max-w-2xl flex-col px-6 py-10">
			<div className="sticky top-4 z-20 rounded-2xl bg-background/95 pb-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
				<div className="mb-4 inline-flex rounded-2xl border border-slate-200 bg-white p-1">
					<button
						type="button"
						onClick={() => setMode("signin")}
						className={`rounded-xl px-4 py-2 text-sm font-medium ${
							mode === "signin" ? "bg-slate-900 text-white" : "text-slate-600"
						}`}
					>
						로그인
					</button>
					<button
						type="button"
						onClick={() => setMode("signup")}
						className={`rounded-xl px-4 py-2 text-sm font-medium ${
							mode === "signup" ? "bg-slate-900 text-white" : "text-slate-600"
						}`}
					>
						회원가입
					</button>
				</div>
				{mode === "signup" && (
					<LoginStepHeader currentStep={currentStep} totalSteps={TOTAL_STEPS} />
				)}
			</div>
			<div className="mt-8">{renderStepView()}</div>
		</div>
	);
}
