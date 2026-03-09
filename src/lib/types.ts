// Bootstrap Static - season data
export interface BootstrapStatic {
  events: FPLEvent[];
  teams: FPLTeam[];
  elements: Player[];
  element_types: ElementType[];
}

export interface FPLEvent {
  id: number;
  name: string;
  deadline_time: string;
  finished: boolean;
  is_current: boolean;
  is_next: boolean;
  is_previous: boolean;
  average_entry_score: number;
  highest_score: number;
  highest_scoring_entry: number;
  most_selected: number;
  most_transferred_in: number;
  most_captained: number;
  most_vice_captained: number;
  top_element: number;
  top_element_info: { id: number; points: number } | null;
  chip_plays: { chip_name: string; num_played: number }[];
}

export interface FPLTeam {
  id: number;
  name: string;
  short_name: string;
  code: number;
  strength: number;
}

export interface Player {
  id: number;
  web_name: string;
  first_name: string;
  second_name: string;
  team: number;
  element_type: number;
  now_cost: number;
  total_points: number;
  form: string;
  selected_by_percent: string;
  minutes: number;
  goals_scored: number;
  assists: number;
  clean_sheets: number;
  bonus: number;
}

export interface ElementType {
  id: number;
  singular_name: string;
  singular_name_short: string;
  plural_name: string;
  plural_name_short: string;
}

// League standings
export interface LeagueStandingsResponse {
  league: LeagueInfo;
  standings: {
    results: StandingsEntry[];
    has_next: boolean;
  };
  new_entries: {
    results: unknown[];
    has_next: boolean;
  };
  last_updated_data: string;
}

export interface LeagueInfo {
  id: number;
  name: string;
  created: string;
  admin_entry: number;
}

export interface StandingsEntry {
  id: number;
  entry: number;
  entry_name: string;
  player_name: string;
  rank: number;
  last_rank: number;
  total: number;
  event_total: number;
  has_played: boolean;
}

// Manager entry
export interface ManagerEntry {
  id: number;
  player_first_name: string;
  player_last_name: string;
  name: string;
  summary_overall_points: number;
  summary_overall_rank: number;
  summary_event_points: number;
  summary_event_rank: number;
  current_event: number;
  favourite_team: number;
  started_event: number;
}

// Manager entry with leagues (from /entry/{id}/ endpoint)
export interface ManagerLeagueEntry {
  id: number;
  name: string;
  short_name: string | null;
  created: string;
  league_type: string;
  scoring: string;
  rank: number;
  max_entries: number | null;
  admin_entry: number | null;
  entry_rank: number;
  entry_last_rank: number;
  rank_count: number;
  entry_can_leave: boolean;
  entry_can_admin: boolean;
  entry_can_invite: boolean;
}

export interface ManagerWithLeagues extends ManagerEntry {
  leagues: {
    classic: ManagerLeagueEntry[];
    h2h: ManagerLeagueEntry[];
  };
}

// History
export interface EntryHistory {
  current: GameweekHistory[];
  past: PastSeason[];
  chips: ChipUsage[];
}

export interface GameweekHistory {
  event: number;
  points: number;
  total_points: number;
  rank: number;
  rank_sort: number;
  overall_rank: number;
  percentile_rank: number;
  bank: number;
  value: number;
  event_transfers: number;
  event_transfers_cost: number;
  points_on_bench: number;
}

export interface PastSeason {
  season_name: string;
  total_points: number;
  rank: number;
}

export interface ChipUsage {
  name: string;
  time: string;
  event: number;
}

// Gameweek picks
export interface GameweekPicks {
  active_chip: string | null;
  automatic_subs: AutoSub[];
  entry_history: GameweekHistory;
  picks: Pick[];
}

export interface AutoSub {
  entry: number;
  element_in: number;
  element_out: number;
  event: number;
}

export interface Pick {
  element: number;
  position: number;
  multiplier: number;
  is_captain: boolean;
  is_vice_captain: boolean;
}

// Live event
export interface LiveEvent {
  elements: LivePlayer[];
}

export interface LivePlayer {
  id: number;
  stats: PlayerStats;
  explain: FixtureExplain[];
}

export interface PlayerStats {
  minutes: number;
  goals_scored: number;
  assists: number;
  clean_sheets: number;
  goals_conceded: number;
  own_goals: number;
  penalties_saved: number;
  penalties_missed: number;
  yellow_cards: number;
  red_cards: number;
  saves: number;
  bonus: number;
  bps: number;
  total_points: number;
}

export interface FixtureExplain {
  fixture: number;
  stats: { identifier: string; points: number; value: number }[];
}

// Fixtures
export interface Fixture {
  id: number;
  event: number | null;
  kickoff_time: string | null;
  started: boolean | null;
  finished: boolean;
  finished_provisional: boolean;
  minutes: number;
  team_h: number;
  team_a: number;
  team_h_score: number | null;
  team_a_score: number | null;
  team_h_difficulty: number;
  team_a_difficulty: number;
  stats: FixtureStat[];
}

export interface FixtureStat {
  identifier: string;
  a: { element: number; value: number }[];
  h: { element: number; value: number }[];
}

// Transfers
export interface Transfer {
  element_in: number;
  element_in_cost: number;
  element_out: number;
  element_out_cost: number;
  entry: number;
  event: number;
  time: string;
}
