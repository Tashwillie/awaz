interface TrainingStepProps {
  onOpenTrainingFlow: () => void
}

export function TrainingStep({ onOpenTrainingFlow }: TrainingStepProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center text-gray-700">
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Training</h2>
      <p className="mb-6">
        Use the multi‑step training flow to search your Google Business Profile, 
        build the agent profile, and verify the call. This is the same 5‑step 
        experience you used on the /demo page.
      </p>
      <button
        onClick={onOpenTrainingFlow}
        className="bg-brand-teal-100 text-white px-5 py-2 rounded-lg hover:bg-brand-teal-200 transition-colors duration-200"
      >
        Open Training Flow
      </button>
    </div>
  )
}
