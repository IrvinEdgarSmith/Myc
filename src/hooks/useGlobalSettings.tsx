import { useState, useEffect } from 'react';
import { GlobalSettings, SystemPersona, EnhancementType } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// No default system personas
const DEFAULT_PERSONAS: SystemPersona[] = [];

export const useGlobalSettings = () => {
  const [settings, setSettings] = useState<GlobalSettings>(() => {
    const savedSettings = localStorage.getItem('mycelial-global-settings');

    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);

        // Filter out any system personas
        let personasToUse = parsedSettings.systemPersonas?.filter((p: SystemPersona) => !p.isSystem) || [];

        return {
          ...parsedSettings,
          // Remove brave API key
          braveApiKey: '',
          // Remove web search model ID
          selectedWebSearchModelId: '',
          systemPersonas: personasToUse
        };
      } catch (error) {
        console.error('Error parsing global settings:', error);
      }
    }

    // Return default settings if nothing was found in localStorage
    return {
      openRouterApiKey: '',
      defaultSystemPrompt: 'You are a helpful AI assistant. Answer the user\'s questions accurately and concisely.',
      geminiApiKey: '',
      braveApiKey: '',
      selectedEmbeddingModelId: 'gemini-embedding-exp-03-07',
      selectedPromptEngineerModelId: 'gemini-1.0-pro',
      selectedWebSearchModelId: '',
      systemPersonas: [],
      showSystemPrompt: true,
      enhancementTypes: [], // Initialize enhancementTypes
    };
  });

  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('mycelial-global-settings', JSON.stringify(settings));
  }, [settings]);

  // Compute additional state based on settings
  const hasValidGeminiKey = !!settings.geminiApiKey && settings.geminiApiKey.length > 0;
  const hasSelectedEmbeddingModel = !!settings.selectedEmbeddingModelId;
  const hasValidOpenRouterKey = !!settings.openRouterApiKey && settings.openRouterApiKey.length > 0;

  const updateSettings = (newSettings: Partial<GlobalSettings>) => {
    // Ensure we're not adding back braveApiKey or selectedWebSearchModelId
    const { braveApiKey, selectedWebSearchModelId, ...sanitizedSettings } = newSettings;

    setSettings(prev => ({
      ...prev,
      ...sanitizedSettings
    }));

    // Propagate OpenRouter API key change to localStorage for easy access by all components
    if (sanitizedSettings.openRouterApiKey && sanitizedSettings.openRouterApiKey !== settings.openRouterApiKey) {
      localStorage.setItem('openrouter-api-key', sanitizedSettings.openRouterApiKey);
    }
  };

  const addSystemPersona = (
    name: string,
    description: string,
    promptAddition: string,
    iconColor: string,
    gradientFrom?: string,
    gradientTo?: string,
    visibleInChat: boolean = true
  ) => {
    const newPersona: SystemPersona = {
      id: uuidv4(),
      name,
      description,
      promptAddition,
      iconColor,
      gradientFrom,
      gradientTo,
      createdAt: new Date(),
      isSystem: false,
      visibleInChat
    };

    setSettings(prev => ({
      ...prev,
      systemPersonas: [...prev.systemPersonas, newPersona]
    }));

    return newPersona;
  };

  const updateSystemPersona = (id: string, updates: Partial<SystemPersona>) => {
    setSettings(prev => ({
      ...prev,
      systemPersonas: prev.systemPersonas.map(persona =>
        persona.id === id ? { ...persona, ...updates } : persona
      )
    }));
  };

  const deleteSystemPersona = (id: string) => {
    // Just delete the persona - we've removed system personas
    setSettings(prev => ({
      ...prev,
      systemPersonas: prev.systemPersonas.filter(persona => persona.id !== id)
    }));

    return true;
  };

    // Enhancement Type Management
    const addEnhancementType = (name: string, systemPromptModifications: string, knowledgeContext?: string) => {
      const newEnhancementType: EnhancementType = {
        id: uuidv4(),
        name,
        systemPromptModifications,
        knowledgeContext,
      };
      updateSettings({
        enhancementTypes: [...(settings.enhancementTypes || []), newEnhancementType],
      });
      return newEnhancementType;
    };

    const updateEnhancementType = (id: string, updates: Partial<EnhancementType>) => {
      updateSettings({
        enhancementTypes: settings.enhancementTypes?.map(type =>
          type.id === id ? { ...type, ...updates } : type
        ),
      });
    };

    const deleteEnhancementType = (id: string) => {
      updateSettings({
        enhancementTypes: settings.enhancementTypes?.filter(type => type.id !== id),
      });
    };

  return {
    settings,
    updateSettings,
    addSystemPersona,
    updateSystemPersona,
    deleteSystemPersona,
    hasValidGeminiKey,
    hasSelectedEmbeddingModel,
    hasValidOpenRouterKey,
    addEnhancementType,
    updateEnhancementType,
    deleteEnhancementType,
  };
};
