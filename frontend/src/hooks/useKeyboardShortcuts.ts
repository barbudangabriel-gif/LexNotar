import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  description: string;
  action: () => void;
}

export const useKeyboardShortcuts = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [showHelp, setShowHelp] = useState(false);

  const shortcuts: KeyboardShortcut[] = [
    {
      key: 'k',
      ctrl: true,
      description: t('common.search'),
      action: () => {
        const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      },
    },
    {
      key: 'd',
      ctrl: true,
      description: t('navigation.dashboard'),
      action: () => navigate('/dashboard'),
    },
    {
      key: 'c',
      ctrl: true,
      shift: true,
      description: t('navigation.cases'),
      action: () => navigate('/cases'),
    },
    {
      key: 'l',
      ctrl: true,
      shift: true,
      description: t('navigation.clients'),
      action: () => navigate('/clients'),
    },
    {
      key: 't',
      ctrl: true,
      shift: true,
      description: t('navigation.tasks'),
      action: () => navigate('/tasks'),
    },
    {
      key: 'm',
      ctrl: true,
      shift: true,
      description: t('navigation.documents'),
      action: () => navigate('/documents'),
    },
    {
      key: 'a',
      ctrl: true,
      shift: true,
      description: t('navigation.calendar'),
      action: () => navigate('/calendar'),
    },
    {
      key: '?',
      description: 'Show keyboard shortcuts',
      action: () => setShowHelp(true),
    },
  ];

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.contentEditable === 'true'
      ) {
        // Allow "?" to show help even in input fields when pressed with shift
        if (event.key !== '?') {
          return;
        }
      }

      for (const shortcut of shortcuts) {
        const ctrlMatch = shortcut.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
        const altMatch = shortcut.alt ? event.altKey : !event.altKey;
        const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;

        if (
          event.key.toLowerCase() === shortcut.key.toLowerCase() &&
          ctrlMatch &&
          altMatch &&
          shiftMatch
        ) {
          event.preventDefault();
          shortcut.action();
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate, t]);

  return { shortcuts, showHelp, setShowHelp };
};
