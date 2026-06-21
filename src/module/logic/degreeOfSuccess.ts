import type { DegreeOfSuccess, HarvestOutcome, HarvestRollData } from "./types";

export function determineDegreeOfSuccess(roll: HarvestRollData): DegreeOfSuccess {
  const margin = roll.total - roll.dc;

  let degree: DegreeOfSuccess;
  if (margin >= 10) {
    degree = "criticalSuccess";
  } else if (margin >= 0) {
    degree = "success";
  } else if (margin <= -10) {
    degree = "criticalFailure";
  } else {
    degree = "failure";
  }

  if (roll.d20 === 20) {
    degree = shiftDegree(degree, 1);
  } else if (roll.d20 === 1) {
    degree = shiftDegree(degree, -1);
  }

  return degree;
}

function shiftDegree(degree: DegreeOfSuccess, amount: 1 | -1): DegreeOfSuccess {
  const order: DegreeOfSuccess[] = ["criticalFailure", "failure", "success", "criticalSuccess"];
  const current = order.indexOf(degree);
  const next = Math.min(3, Math.max(0, current + amount));
  return order[next];
}

export function getHarvestOutcome(degree: DegreeOfSuccess): HarvestOutcome {
  switch (degree) {
    case "criticalSuccess":
      return { degree, partCount: 3, damagedCount: 0 };
    case "success":
      return { degree, partCount: 2, damagedCount: 0 };
    case "failure":
      return { degree, partCount: 0, damagedCount: 1 };
    case "criticalFailure":
      return { degree, partCount: 0, damagedCount: 0 };
  }
}

export function formatDegreeLabel(degree: DegreeOfSuccess): string {
  switch (degree) {
    case "criticalSuccess":
      return "Critical Success";
    case "success":
      return "Success";
    case "failure":
      return "Failure";
    case "criticalFailure":
      return "Critical Failure";
  }
}
