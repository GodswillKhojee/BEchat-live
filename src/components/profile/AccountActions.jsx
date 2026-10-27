import { useNavigate } from "react-router-dom";
import Card from "../../common/Card";

export default function AccountActions() {
  const navigate = useNavigate();

  return (
    <Card
      title="Account"
      description="Sign out here. Account deletion will arrive with the backend."
      className="lg:col-span-2"
    >
      <div className="flex flex-wrap gap-3">
        {/* Placeholder: also clear the stored token here once JWT auth exists. */}
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="min-h-[44px] rounded-[10px] border border-[#e6e0e9] bg-white px-5 py-2.5 text-[12px] font-semibold text-[#554c5d] transition hover:border-[#C4A4DA] hover:bg-[#fbf8fd] sm:text-[13px]"
        >
          Sign out
        </button>

        <button
          type="button"
          disabled
          title="Available once the backend is connected"
          className="min-h-[44px] cursor-not-allowed rounded-[10px] border border-[#f0d5db] bg-white px-5 py-2.5 text-[12px] font-semibold text-[#c0566b] opacity-50 sm:text-[13px]"
        >
          Delete account
        </button>
      </div>
    </Card>
  );
}