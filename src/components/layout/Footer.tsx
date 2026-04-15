import { resetAll } from "../../data/store";
import { TEST_IDS } from "../../shared/testIds";

export default function Footer() {
  const handleReset = () => {
    resetAll();
    window.location.reload();
  };

  return (
    <footer
      data-testid={TEST_IDS.footer.container}
      className="border-t border-white/10 px-6 py-4 flex items-center justify-between text-sm text-gray-500"
    >
      <span data-testid={TEST_IDS.footer.version}>TredGate QA Hub v4.0.0</span>
      <button
        data-testid={TEST_IDS.footer.btnReset}
        onClick={handleReset}
        className="btn-ghost text-red-400 hover:text-red-300"
      >
        Reset Data
      </button>
    </footer>
  );
}
