import { apiPost } from './client';
import type { ThemeConfig } from '../context/ThemeContext';

interface CustomizeResponse {
  theme: ThemeConfig;
  message: string;
}

export function customizeTheme(
  prompt: string,
  currentTheme: ThemeConfig | null,
): Promise<CustomizeResponse> {
  return apiPost<CustomizeResponse>('/customize', {
    prompt,
    current_theme: currentTheme,
  });
}
