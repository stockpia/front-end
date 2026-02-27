import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CommonModal from "@/components/CommonModal";

type AccountInfoStepProps = {
  onPrev: () => void;
};

export default function AccountInfoStep({ onPrev }: AccountInfoStepProps) {
  const navigate = useNavigate();
  const [accountNumber, setAccountNumber] = useState("");
  const [appKey, setAppKey] = useState("");
  const [appSecretKey, setAppSecretKey] = useState("");
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const isSubmitDisabled =
    !accountNumber.trim() || !appKey.trim() || !appSecretKey.trim();

  const handleMoveToChatbot = () => {
    window.close();
  };

  return (
    <section className="w-full rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_12px_40px_-32px_rgba(15,23,42,0.6)]">
      <h2 className="text-xl font-semibold">계좌 정보 입력</h2>
      <div className="mt-5 space-y-8 text-left">
        <label className="block">
          <span className="mb-1 block text-sm">한국투자증권 계좌번호</span>
          <input
            className="w-full rounded-md border px-3 py-2"
            type="text"
            placeholder="계좌번호를 입력하세요"
            value={accountNumber}
            onChange={(event) => setAccountNumber(event.target.value)}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm">APP key</span>
          <input
            className="w-full rounded-md border px-3 py-2"
            type="text"
            placeholder="APP key를 입력하세요"
            value={appKey}
            onChange={(event) => setAppKey(event.target.value)}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm">APP secret key</span>
          <input
            className="w-full rounded-md border px-3 py-2"
            type="password"
            placeholder="APP secret key를 입력하세요"
            value={appSecretKey}
            onChange={(event) => setAppSecretKey(event.target.value)}
          />
        </label>
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
          disabled={isSubmitDisabled}
          className="rounded-lg bg-primary px-5 py-2 font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50">
          연동 완료
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
