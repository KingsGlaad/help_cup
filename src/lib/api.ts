/* eslint-disable @typescript-eslint/no-explicit-any */
export const API_BASE = "/api/worldcup";

export interface Team {
  team_key: string;
  team_name: string;
  team_badge: string;
}

export interface Standing {
  country_name: string;
  league_id: string;
  league_name: string;
  team_id: string;
  team_name: string;
  overall_promotion: string;
  overall_league_position: string;
  overall_league_payed: string;
  overall_league_W: string;
  overall_league_D: string;
  overall_league_L: string;
  overall_league_GF: string;
  overall_league_GA: string;
  overall_league_PTS: string;
  league_round: string;
  team_badge: string;
  fk_stage_key: string;
  stage_name: string;
}

export interface Game {
  match_id: string;
  country_id: string;
  country_name: string;
  league_id: string;
  league_name: string;
  match_date: string;
  match_status: string;
  match_time: string;
  match_hometeam_id: string;
  match_hometeam_name: string;
  match_hometeam_score: string;
  match_awayteam_name: string;
  match_awayteam_id: string;
  match_awayteam_score: string;
  match_hometeam_halftime_score: string;
  match_awayteam_halftime_score: string;
  match_hometeam_extra_score: string;
  match_awayteam_extra_score: string;
  match_hometeam_penalty_score: string;
  match_awayteam_penalty_score: string;
  match_hometeam_ft_score: string;
  match_awayteam_ft_score: string;
  match_hometeam_system: string;
  match_awayteam_system: string;
  match_live: string;
  match_round: string;
  match_stadium: string;
  match_referee: string;
  team_home_badge: string;
  team_away_badge: string;
  league_logo: string;
  country_logo: string;
  league_year: string;
  fk_stage_key: string;
  stage_name: string;
  goalscorer?: Array<{
    time: string;
    home_scorer: string;
    home_scorer_id: string;
    home_assist: string;
    home_assist_id: string;
    score: string;
    away_scorer: string;
    away_scorer_id: string;
    away_assist: string;
    away_assist_id: string;
    info: string;
    info_time: string;
  }>;
  cards?: Array<{
    time: string;
    home_fault: string;
    card: string;
    away_fault: string;
    info: string;
    home_player_id: string;
    away_player_id: string;
    info_time: string;
  }>;
  substitutions?: { home: Array<any>; away: Array<any> };
  lineup?: {
    home: {
      starting_lineups: Array<any>;
      substitutes: Array<any>;
      coach: Array<any>;
    };
    away: {
      starting_lineups: Array<any>;
      substitutes: Array<any>;
      coach: Array<any>;
    };
  };
  statistics?: Array<{ type: string; home: string; away: string }>;
}

export interface Odd {
  match_id: string;
  odd_bookmakers: string;
  odd_date: string;
  odd_1: string;
  odd_x: string;
  odd_2: string;
  [key: string]: any;
}

// Fetcher generic para SWR
export const fetcher = (url: string) => fetch(url).then((res) => res.json());

export const endpoints = {
  groups: `${API_BASE}/get/groups`,
  teams: `${API_BASE}/get/teams`,
  games: `${API_BASE}/get/games`,
  odds: (matchId: string) => `${API_BASE}/get/odds?match_id=${matchId}`,
};
