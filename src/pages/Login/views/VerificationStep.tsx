import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CommonModal from "@/components/CommonModal";

type VerificationStepProps = {
  onPrev: () => void;
};

export default function VerificationStep({ onPrev }: VerificationStepProps) {
  const navigate = useNavigate();
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const handleMoveToChatbot = () => {
    window.close();
  };

  return (
    <section className="w-full rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_12px_40px_-32px_rgba(15,23,42,0.6)]">
      <h2 className="text-xl font-semibold">본인 확인</h2>
      <div className="mt-4">
        {!isCodeSent ? (
          <button
            type="button"
            onClick={() => setIsCodeSent(true)}
            className="w-full rounded-lg border px-4 py-2 font-medium">
            인증번호 전송
          </button>
        ) : (
          <label className="block">
            <span className="mb-1 block text-sm">인증번호 입력</span>
            <input
              className="w-full rounded-md border px-3 py-2"
              type="text"
              placeholder="인증번호 6자리"
            />
          </label>
        )}
      </div>
      <div className="mt-6 flex justify-between">
        <button
          type="button"
          onClick={onPrev}
          className="rounded-lg border px-5 py-2 font-medium">
          이전
        </button>
        <button
          type="button"
          onClick={() => setIsSuccessModalOpen(true)}
          disabled={!isCodeSent}
          className="rounded-lg bg-primary px-5 py-2 font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50">
          확인
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
