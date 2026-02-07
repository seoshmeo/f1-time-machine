export interface TeamColors {
  primary: string;
  secondary: string;
}

export const teamColors: Record<string, TeamColors> = {
  red_bull: {
    primary: '#1E41FF',
    secondary: '#FFD700',
  },
  ferrari: {
    primary: '#DC0000',
    secondary: '#FFF200',
  },
  mclaren: {
    primary: '#FF8700',
    secondary: '#C0C0C0',
  },
  mercedes: {
    primary: '#00D2BE',
    secondary: '#000000',
  },
  renault: {
    primary: '#FFF500',
    secondary: '#000000',
  },
  williams: {
    primary: '#0082FA',
    secondary: '#FFFFFF',
  },
  force_india: {
    primary: '#FF80C7',
    secondary: '#000000',
  },
  sauber: {
    primary: '#006EFF',
    secondary: '#FFFFFF',
  },
  toro_rosso: {
    primary: '#0033CC',
    secondary: '#DC0000',
  },
  lotus: {
    primary: '#00622B',
    secondary: '#FFD700',
  },
  virgin: {
    primary: '#C80000',
    secondary: '#FFFFFF',
  },
  hispania: {
    primary: '#E2001A',
    secondary: '#FFFFFF',
  },
};

export function getTeamColor(constructorRef: string): TeamColors {
  return teamColors[constructorRef] || { primary: '#666666', secondary: '#FFFFFF' };
}

export function getTeamPrimaryColor(constructorRef: string): string {
  return getTeamColor(constructorRef).primary;
}

export function getTeamSecondaryColor(constructorRef: string): string {
  return getTeamColor(constructorRef).secondary;
}
