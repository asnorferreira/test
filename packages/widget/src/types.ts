export interface ChecklistItem {
  label: string;
  done: boolean;
}

export interface CoachData {
  next_action: string;
  next_action_priority?: 'high' | 'medium' | 'low';
  suggestions: string[];
  checklist: ChecklistItem[];
  blockers: string[];
  // Informações do atendimento
  client_name?: string;
  client_status?: 'online' | 'offline' | 'away';
  conversation_id?: string;
  start_time?: string;
}
