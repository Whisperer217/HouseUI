import { useState } from 'react';
import { Shield, Heart, AlertTriangle, Phone } from 'lucide-react';

interface EmergencyScenario {
  id: string;
  title: string;
  icon: any;
  color: string;
  steps: string[];
  warnings: string[];
  call911: boolean;
}

const EMERGENCY_SCENARIOS: EmergencyScenario[] = [
  {
    id: 'bleeding',
    title: 'Severe Bleeding (Stop the Bleed)',
    icon: AlertTriangle,
    color: 'red',
    call911: true,
    warnings: [
      'Call 911 immediately for severe bleeding',
      'Do not remove objects embedded in wounds',
      'If bleeding doesn\'t stop after 10 minutes of pressure, seek immediate help'
    ],
    steps: [
      '1. CALL 911 - Get help on the way immediately',
      '2. ENSURE SCENE SAFETY - Make sure you and the victim are safe',
      '3. FIND THE BLEEDING - Locate the source of bleeding',
      '4. APPLY DIRECT PRESSURE - Use clean cloth or gauze, press firmly on wound',
      '5. MAINTAIN PRESSURE - Keep pressing for at least 10 minutes without checking',
      '6. IF BLEEDING CONTINUES - Apply tourniquet 2-3 inches above wound (for limbs only)',
      '7. TOURNIQUET APPLICATION - Tighten until bleeding stops, note the time',
      '8. PACK THE WOUND - If bleeding continues, pack wound with gauze and apply pressure',
      '9. MONITOR VICTIM - Check for shock (pale, cold, rapid pulse)',
      '10. KEEP VICTIM WARM - Cover with blanket, elevate legs if no spinal injury'
    ]
  },
  {
    id: 'cpr',
    title: 'CPR (Cardiac Arrest)',
    icon: Heart,
    color: 'pink',
    call911: true,
    warnings: [
      'Call 911 before starting CPR',
      'Only perform CPR if person is unresponsive and not breathing',
      'Continue CPR until help arrives or person starts breathing'
    ],
    steps: [
      '1. CHECK RESPONSIVENESS - Tap shoulders and shout "Are you okay?"',
      '2. CALL 911 - Or have someone else call while you start CPR',
      '3. POSITION VICTIM - Lay person flat on firm surface',
      '4. HAND PLACEMENT - Place heel of one hand on center of chest, other hand on top',
      '5. BODY POSITION - Lock elbows, shoulders directly over hands',
      '6. COMPRESSIONS - Push hard and fast, at least 2 inches deep',
      '7. COMPRESSION RATE - 100-120 compressions per minute (think "Stayin\' Alive" tempo)',
      '8. ALLOW RECOIL - Let chest fully rise between compressions',
      '9. CONTINUE - 30 compressions, then 2 rescue breaths (if trained)',
      '10. DON\'T STOP - Continue until help arrives or AED is available'
    ]
  },
  {
    id: 'choking',
    title: 'Choking (Heimlich Maneuver)',
    icon: AlertTriangle,
    color: 'orange',
    call911: false,
    warnings: [
      'If person can cough or speak, encourage coughing',
      'Call 911 if person becomes unconscious',
      'For infants under 1 year, use back blows and chest thrusts instead'
    ],
    steps: [
      '1. ASK "ARE YOU CHOKING?" - Confirm they cannot breathe or speak',
      '2. STAND BEHIND PERSON - Position yourself behind them',
      '3. MAKE A FIST - Place thumb side against stomach, above navel',
      '4. GRASP FIST - With other hand, grasp your fist',
      '5. QUICK UPWARD THRUSTS - Press hard into abdomen with quick upward motion',
      '6. REPEAT - Continue thrusts until object is expelled or person becomes unconscious',
      '7. IF UNCONSCIOUS - Lower to ground and begin CPR',
      '8. CHECK MOUTH - Before rescue breaths, look for object and remove if visible',
      '9. CONTINUE CPR - Until help arrives',
      '10. SEEK MEDICAL ATTENTION - Even if successful, get checked by doctor'
    ]
  },
  {
    id: 'shock',
    title: 'Shock (Trauma Response)',
    icon: Shield,
    color: 'purple',
    call911: true,
    warnings: [
      'Shock can be life-threatening',
      'Do not give food or water',
      'Keep person lying down unless vomiting or having trouble breathing'
    ],
    steps: [
      '1. CALL 911 - Shock requires immediate medical attention',
      '2. LAY PERSON DOWN - Keep them lying flat',
      '3. ELEVATE LEGS - Raise legs about 12 inches (unless spinal injury suspected)',
      '4. KEEP WARM - Cover with blanket to prevent heat loss',
      '5. LOOSEN CLOTHING - Remove tight clothing around neck and waist',
      '6. DO NOT GIVE FLUIDS - No food or water',
      '7. MONITOR BREATHING - Check breathing and pulse regularly',
      '8. TURN HEAD - If vomiting, turn head to side to prevent choking',
      '9. REASSURE - Keep person calm and comfortable',
      '10. WAIT FOR HELP - Do not leave person alone'
    ]
  }
];

export default function EmergencyMedical() {
  const [selectedScenario, setSelectedScenario] = useState<EmergencyScenario | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  const handleScenarioSelect = (scenario: EmergencyScenario) => {
    setSelectedScenario(scenario);
    setCurrentStep(0);
  };

  const handleNextStep = () => {
    if (selectedScenario && currentStep < selectedScenario.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCall911 = () => {
    // In a real app, this would trigger actual 911 call
    window.open('tel:911');
  };

  if (!selectedScenario) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-red-500">Emergency Medical Guidance</h2>
          <p className="text-gray-400">Select an emergency scenario for step-by-step guidance</p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span>Always call 911 for life-threatening emergencies</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {EMERGENCY_SCENARIOS.map((scenario) => {
            const Icon = scenario.icon;
            return (
              <button
                key={scenario.id}
                onClick={() => handleScenarioSelect(scenario)}
                className={`p-6 bg-gray-800 border-2 border-${scenario.color}-500/30 rounded-lg hover:border-${scenario.color}-500 transition-all text-left group`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 bg-${scenario.color}-500/10 rounded-lg`}>
                    <Icon className={`w-8 h-8 text-${scenario.color}-500`} />
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-xl font-bold text-${scenario.color}-400 mb-2`}>
                      {scenario.title}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {scenario.steps.length} steps • {scenario.call911 ? 'Call 911 First' : 'First Aid'}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <p className="text-yellow-400 text-sm">
            <strong>Disclaimer:</strong> This guidance is for educational purposes. Always seek professional medical help in emergencies. 
            This system was designed by a combat medic but does not replace professional medical training.
          </p>
        </div>
      </div>
    );
  }

  const Icon = selectedScenario.icon;
  const progress = ((currentStep + 1) / selectedScenario.steps.length) * 100;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setSelectedScenario(null)}
          className="text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          ← Back to Scenarios
        </button>
        {selectedScenario.call911 && (
          <button
            onClick={handleCall911}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition-colors"
          >
            <Phone className="w-4 h-4" />
            CALL 911
          </button>
        )}
      </div>

      {/* Scenario Title */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-3">
          <Icon className={`w-10 h-10 text-${selectedScenario.color}-500`} />
          <h2 className={`text-3xl font-bold text-${selectedScenario.color}-400`}>
            {selectedScenario.title}
          </h2>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-2">
          <div
            className={`bg-${selectedScenario.color}-500 h-2 rounded-full transition-all duration-300`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-gray-400">
          Step {currentStep + 1} of {selectedScenario.steps.length}
        </p>
      </div>

      {/* Warnings */}
      {selectedScenario.warnings.length > 0 && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg space-y-2">
          <div className="flex items-center gap-2 text-red-400 font-bold">
            <AlertTriangle className="w-5 h-5" />
            <span>IMPORTANT WARNINGS</span>
          </div>
          <ul className="space-y-1 text-red-300 text-sm">
            {selectedScenario.warnings.map((warning, idx) => (
              <li key={idx}>• {warning}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Current Step */}
      <div className="p-8 bg-gray-800 border-2 border-cyan-500/30 rounded-lg">
        <div className="text-center space-y-4">
          <div className={`text-6xl font-bold text-${selectedScenario.color}-500`}>
            {currentStep + 1}
          </div>
          <p className="text-2xl text-white font-semibold">
            {selectedScenario.steps[currentStep]}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-4">
        <button
          onClick={handlePrevStep}
          disabled={currentStep === 0}
          className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ← Previous Step
        </button>
        <button
          onClick={handleNextStep}
          disabled={currentStep === selectedScenario.steps.length - 1}
          className={`flex-1 px-6 py-3 bg-${selectedScenario.color}-500 hover:bg-${selectedScenario.color}-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed`}
        >
          Next Step →
        </button>
      </div>

      {/* All Steps Overview */}
      <div className="p-4 bg-gray-800 rounded-lg">
        <h3 className="text-lg font-bold text-cyan-400 mb-3">All Steps Overview</h3>
        <ol className="space-y-2">
          {selectedScenario.steps.map((step, idx) => (
            <li
              key={idx}
              className={`text-sm ${
                idx === currentStep
                  ? `text-${selectedScenario.color}-400 font-bold`
                  : idx < currentStep
                  ? 'text-green-400'
                  : 'text-gray-500'
              }`}
            >
              {step}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

