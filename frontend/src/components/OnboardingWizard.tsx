import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, CheckCircle, FileText, Upload, Users, Calendar } from 'lucide-react';
import { useOnboarding } from '../context/OnboardingContext';

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  action?: {
    label: string;
    path: string;
  };
}

const OnboardingWizard = () => {
  const navigate = useNavigate();
  const { showOnboarding, setShowOnboarding, completeOnboarding } = useOnboarding();
  const [currentStep, setCurrentStep] = useState(0);

  // Don't use useTranslation - use hardcoded strings to avoid i18n initialization issues
  // const { t } = useTranslation();

  const steps: OnboardingStep[] = [
    {
      id: 1,
      title: 'Welcome to LexNotar',
      description: 'Your comprehensive notary case management system. Let\'s get you started with a quick tour of the key features.',
      icon: <CheckCircle className="w-16 h-16 text-indigo-600" />,
    },
    {
      id: 2,
      title: 'Create Your First Case',
      description: 'Cases are at the heart of LexNotar. Start by creating a case to track notarial acts, documents, and client interactions.',
      icon: <FileText className="w-16 h-16 text-indigo-600" />,
      action: {
        label: 'Create Case',
        path: '/cases/new',
      },
    },
    {
      id: 3,
      title: 'Upload Documents',
      description: 'Upload and manage all your case documents in one place. LexNotar supports versioning, previews, and digital signatures.',
      icon: <Upload className="w-16 h-16 text-indigo-600" />,
      action: {
        label: 'Upload Document',
        path: '/documents/upload',
      },
    },
    {
      id: 4,
      title: 'Manage Clients',
      description: 'Keep track of your clients\' information, cases, and documents. Build strong relationships with comprehensive CRM features.',
      icon: <Users className="w-16 h-16 text-indigo-600" />,
      action: {
        label: 'Add Client',
        path: '/clients/new',
      },
    },
    {
      id: 5,
      title: 'Schedule Events',
      description: 'Use the calendar to schedule appointments, deadlines, and reminders. Never miss an important date.',
      icon: <Calendar className="w-16 h-16 text-indigo-600" />,
      action: {
        label: 'View Calendar',
        path: '/calendar',
      },
    },
  ];

  if (!showOnboarding) return null;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    completeOnboarding();
  };

  const handleAction = (path: string) => {
    setShowOnboarding(false);
    navigate(path);
  };

  const step = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full mx-4 overflow-hidden">
        {/* Progress Bar */}
        <div className="h-2 bg-gray-200 dark:bg-gray-700">
          <div
            className="h-full bg-indigo-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Header */}
        <div className="p-6 border-b dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
              Step {currentStep + 1} of {steps.length}
            </span>
          </div>
          <button
            onClick={handleSkip}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 text-center">
          <div className="flex justify-center mb-6">
            {step.icon}
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {step.title}
          </h2>
          
          <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
            {step.description}
          </p>

          {step.action && (
            <button
              onClick={() => handleAction(step.action!.path)}
              className="mb-6 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              {step.action.label}
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 dark:bg-gray-900 border-t dark:border-gray-700 flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>

          <div className="flex space-x-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentStep
                    ? 'bg-indigo-600'
                    : index < currentStep
                    ? 'bg-indigo-400'
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              />
            ))}
          </div>

          <div className="flex space-x-2">
            <button
              onClick={handleSkip}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors"
            >
              Skip Tour
            </button>
            <button
              onClick={handleNext}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors font-medium"
            >
              {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingWizard;
