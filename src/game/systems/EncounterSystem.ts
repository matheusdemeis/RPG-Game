export class EncounterSystem {
  private steps = 0;
  private grace = 0;
  constructor(private random: () => number = Math.random) {}
  protect(steps = 6) {
    this.grace = steps;
    this.steps = 0;
  }
  step(inGrass: boolean, hasCompanion: boolean, firstEncounter: boolean): boolean {
    if (this.grace > 0) {
      this.grace--;
      return false;
    }
    if (!inGrass || !hasCompanion) return false;
    this.steps++;
    if (
      (firstEncounter && this.steps >= 3) ||
      this.steps >= 12 ||
      (this.steps >= 3 && this.random() < 0.17)
    ) {
      this.steps = 0;
      return true;
    }
    return false;
  }
}
