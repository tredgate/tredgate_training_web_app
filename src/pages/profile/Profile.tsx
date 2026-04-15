import { TEST_IDS } from "../../shared/testIds";

export default function Profile() {
  return (
    <div data-testid={TEST_IDS.profile.page}>
      <h1 className="text-2xl font-bold text-white">Profile</h1>
      <p className="text-gray-400 mt-2">Coming soon...</p>
    </div>
  );
}
