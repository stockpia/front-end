
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CommonModal from "@/components/CommonModal";

type VerificationStepProps = {
  onPrev: () => void;
};

export default function VerificationStep({ onPrev }: VerificationStepProps) {
  const navigate = useNavigate();
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const isTimerRunning = isCodeSent && remainingSeconds > 0;
  const formattedTime = `${String(Math.floor(remainingSeconds / 60)).padStart(2, "0")}:${String(remainingSeconds % 60).padStart(2, "0")}`;

  useEffect(() => {
    if (!isTimerRunning) return;

    const timer = window.setInterval(() => {
      setRemainingSeconds((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [isTimerRunning]);

  const handleSendCode = () => {
    if (!phoneNumber.trim()) return;
    setIsCodeSent(true);
    setRemainingSeconds(180);
  };

  const handleVerifyCode = () => {
    if (!isCodeSent || !verificationCode.trim() || remainingSeconds <= 0)
      return;
    setIsSuccessModalOpen(true);
  };

  const handleMoveToChatbot = () => {
    window.close();
  };

  return (
    <section className="w-full rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_12px_40px_-32px_rgba(15,23,42,0.6)]">
      <h2 className="text-xl font-semibold">본인 확인</h2>
      <div className="mt-4">
        <label className="block">
          <span className="mb-1 block text-sm">전화번호</span>
          <div className="flex gap-2">
            <input
              className="w-full rounded-md border px-3 py-2"
              type="tel"
              placeholder="01012345678"
              value={phoneNumber}
              onChange={(event) => setPhoneNumber(event.target.value)}
            />
            <button
              type="button"
              onClick={handleSendCode}
              disabled={!phoneNumber.trim()}
              className="shrink-0 rounded-lg border px-4 py-2 font-medium disabled:cursor-not-allowed disabled:opacity-50">
              전송
            </button>
          </div>
        </label>

        <label className="mt-8 block">
          <span className="mb-1 block text-sm">인증번호 입력</span>
          <div className="flex gap-2">
            <input
              className="w-full rounded-md border px-3 py-2"
              type="text"
              placeholder="인증번호 6자리"
              value={verificationCode}
              onChange={(event) => setVerificationCode(event.target.value)}
              disabled={!isCodeSent}
            />
            <button
              type="button"
              onClick={handleVerifyCode}
              disabled={
                !isCodeSent || !verificationCode.trim() || remainingSeconds <= 0
              }
              className="shrink-0 rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50">
              확인
            </button>
          </div>
        </label>

        {isCodeSent && (
          <p
            className={`mt-4 text-sm ${remainingSeconds > 0 ? "text-slate-600" : "text-red-500"}`}>
            {remainingSeconds > 0
              ? `입력 기한 ${formattedTime}`
              : "인증번호 입력 시간이 만료되었습니다. 다시 전송해 주세요."}
          </p>
        )}
      </div>
      <div className="mt-6 flex justify-start">
        <button
          type="button"
          onClick={onPrev}
          className="rounded-lg border px-5 py-2 font-medium">
          이전
        </button>
      </div>

      <CommonModal
        open={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title="계좌 연결이 완료됐어요 !"
        description={
          "이제 주토피아에서\n보유 종목/거래내역 기반 리포트를\n바로 확인할 수 있어요!"
        }
        actionLabel="메인 화면으로"
        onAction={() => navigate("/")}
        secondaryActionLabel="챗봇으로"
        onSecondaryAction={handleMoveToChatbot}
      />
    </section>
  );
}
