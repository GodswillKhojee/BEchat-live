import { useNavigate } from "react-router-dom";
import Card from "../../common/Card";
import { useUser } from "../../hooks/useUser";

export default function AccountActions() {
  const navigate = useNavigate();
  const { logout, resetDemoState } = useUser();

  const handleSignOut = () => {
    logout();
    navigate("/login");
  };

  const handleResetData = () => {
    if (
      window.confirm(
        "Reset all demo data? This will restore initial seed conversations, clear sent messages, and reset your profile."
      )
    ) {
      resetDemoState();
      navigate("/login");
    }
  };

  return (
    <Card
      title="Account & Demo Controls"
      description="Manage your demo session or restore initial seed conversations."
      className="lg:col-span-2"
    >
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleSignOut}
          className="min-h-[44px] rounded-[10px] border border-[#e6e0e9] bg-white px-5 py-2.5 text-[12px] font-semibold text-[#554c5d] transition hover:border-[#C4A4DA] hover:bg-[#fbf8fd] sm:text-[13px]"
        >
          Sign out
        </button>

        <button
          type="button"
          onClick={handleResetData}
          title="Restore fresh seed demo conversations and profile"
          className="min-h-[44px] rounded-[10px] border border-[#d8c6e3] bg-[#faf8fc] px-5 py-2.5 text-[12px] font-semibold text-[#603b78] transition hover:border-[#4C2365] hover:bg-[#f3ecf8] sm:text-[13px]"
        >
          Reset Demo Data
        </button>

        <button
          type="button"
          disabled
          title="Permanent account deletion will be implemented with MongoDB in Phase 2"
          className="min-h-[44px] cursor-not-allowed rounded-[10px] border border-[#f0d5db] bg-white px-5 py-2.5 text-[12px] font-semibold text-[#c0566b] opacity-50 sm:text-[13px]"
        >
          Delete account (Phase 2)
        </button>
      </div>
    </Card>
  );
}