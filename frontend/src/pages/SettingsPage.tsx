import { useTranslation } from 'react-i18next';
import { PlayCircle, Info } from 'lucide-react';
import { useOnboarding } from '../context/OnboardingContext';

const SettingsPage = () => {
  const { t } = useTranslation();
  const { startOnboarding } = useOnboarding();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        {t('settings.title')}
      </h1>

      <div className="space-y-6">
        {/* General Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            {t('settings.general')}
          </h2>
          
          <div className="space-y-4">
            {/* Language */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('settings.language')}
              </label>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Use the language switcher in the navigation bar to change the language.
              </p>
            </div>

            {/* Theme */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('settings.theme')}
              </label>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Use the theme toggle in the navigation bar to switch between light and dark mode.
              </p>
            </div>
          </div>
        </div>

        {/* Help & Onboarding */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Help & Tutorials
          </h2>
          
          <div className="space-y-4">
            {/* Restart Onboarding */}
            <div className="flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <Info className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    Restart Welcome Tour
                  </h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Launch the interactive onboarding wizard to learn about LexNotar's key features.
                </p>
              </div>
              <button
                onClick={startOnboarding}
                className="ml-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center space-x-2"
              >
                <PlayCircle className="w-4 h-4" />
                <span>Start Tour</span>
              </button>
            </div>

            {/* Keyboard Shortcuts */}
            <div className="flex items-start p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                  Keyboard Shortcuts
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Press <kbd className="px-2 py-1 text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded">?</kbd> anywhere in the app to see all available keyboard shortcuts.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* System Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            System Information
          </h2>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-2 border-b dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">Version</span>
              <span className="font-medium text-gray-900 dark:text-white">1.0.0</span>
            </div>
            <div className="flex justify-between py-2 border-b dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">Environment</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {import.meta.env.MODE}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600 dark:text-gray-400">API Status</span>
              <span className="font-medium text-green-600 dark:text-green-400">Connected</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
