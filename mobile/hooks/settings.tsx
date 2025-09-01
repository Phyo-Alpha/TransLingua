import React, {
  createContext,
  useState,
  Dispatch,
  SetStateAction,
  useContext
} from 'react';
import { DEFAULT_SETTINGS } from '../config/initial-settings';
import { LanguageSettings } from '../types';

type SettingsProps = {
  settings: LanguageSettings;
  setSettings: Dispatch<SetStateAction<LanguageSettings>>;
};

const SettingContext = createContext<SettingsProps | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({
  children
}: {
  children: React.ReactNode;
}) => {
  const [settings, setSettings] = useState<LanguageSettings>(DEFAULT_SETTINGS);

  return (
    <SettingContext.Provider
      value={{
        settings,
        setSettings
      }}
    >
      {children}
    </SettingContext.Provider>
  );
};
