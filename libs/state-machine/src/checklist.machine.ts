export type ChecklistState =
  | 'AWAITING_GREETING'
  | 'AWAITING_CONFIRMATION'
  | 'AWAITING_DIAGNOSIS'
  | 'AWAITING_PROPOSAL'
  | 'IN_NEGOTIATION'
  | 'CLOSING'
  | 'FINISHED';

const transitions: Record<ChecklistState, ChecklistState[]> = {
  AWAITING_GREETING: ['AWAITING_CONFIRMATION'],
  AWAITING_CONFIRMATION: ['AWAITING_DIAGNOSIS'],
  AWAITING_DIAGNOSIS: ['AWAITING_PROPOSAL'],
  AWAITING_PROPOSAL: ['IN_NEGOTIATION', 'CLOSING'],
  IN_NEGOTIATION: ['CLOSING', 'AWAITING_PROPOSAL'],
  CLOSING: ['FINISHED'],
  FINISHED: [],
};

export class ChecklistStateMachine {
  private currentState: ChecklistState;

  constructor(initialState: ChecklistState = 'AWAITING_GREETING') {
    this.currentState = initialState;
  }

  public transitionTo(newState: ChecklistState): boolean {
    const validTransitions = transitions[this.currentState];
    if (validTransitions && validTransitions.includes(newState)) {
      console.log(`Transitioning from ${this.currentState} to ${newState}`);
      this.currentState = newState;
      return true;
    }
    console.warn(`Invalid transition from ${this.currentState} to ${newState}`);
    return false;
  }

  public getCurrentState(): ChecklistState {
    return this.currentState;
  }
}