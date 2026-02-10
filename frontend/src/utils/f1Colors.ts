export interface TeamColors {
  primary: string;
  secondary: string;
}

export const teamColors: Record<string, TeamColors> = {
  // Multi-era teams
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
  williams: {
    primary: '#0082FA',
    secondary: '#FFFFFF',
  },
  sauber: {
    primary: '#006EFF',
    secondary: '#FFFFFF',
  },
  // 2010-era teams
  renault: {
    primary: '#FFF500',
    secondary: '#000000',
  },
  force_india: {
    primary: '#FF80C7',
    secondary: '#000000',
  },
  toro_rosso: {
    primary: '#0033CC',
    secondary: '#DC0000',
  },
  lotus: {
    primary: '#00622B',
    secondary: '#FFD700',
  },
  lotus_racing: {
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
  hrt: {
    primary: '#E2001A',
    secondary: '#FFFFFF',
  },
  // Modern teams (2020s)
  alpine: {
    primary: '#0090FF',
    secondary: '#FF87BC',
  },
  aston_martin: {
    primary: '#006F62',
    secondary: '#CEDC00',
  },
  haas: {
    primary: '#B6BABD',
    secondary: '#E6002D',
  },
  alfa: {
    primary: '#C00000',
    secondary: '#FFFFFF',
  },
  kick_sauber: {
    primary: '#52E252',
    secondary: '#000000',
  },
  alphatauri: {
    primary: '#2B4562',
    secondary: '#FFFFFF',
  },
  rb: {
    primary: '#6692FF',
    secondary: '#163473',
  },
  cadillac: {
    primary: '#FFD700',
    secondary: '#000000',
  },
  // Historical teams
  racing_point: {
    primary: '#F596C8',
    secondary: '#FFFFFF',
  },
  caterham: {
    primary: '#005030',
    secondary: '#B6A434',
  },
  marussia: {
    primary: '#6E0000',
    secondary: '#000000',
  },
  manor: {
    primary: '#6E0000',
    secondary: '#000000',
  },
  brawn: {
    primary: '#B5D334',
    secondary: '#FFFFFF',
  },
  toyota: {
    primary: '#CC0000',
    secondary: '#FFFFFF',
  },
  bmw_sauber: {
    primary: '#0000FF',
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

// Alias for components that expect different name
export const getConstructorColor = getTeamPrimaryColor;
