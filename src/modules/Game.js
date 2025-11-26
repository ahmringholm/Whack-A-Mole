import { Mole } from './Mole.js';

// Centrera eventhantering via delegering på brädet (se vecko-materialet om addEventListener & bubbling).
// TODO-markeringar lämnar utrymme för egna lösningar.
export class Game {
    constructor({ boardEl, scoreEl, timeEl, missesEl }) {
        this.boardEl = boardEl;
        this.scoreEl = scoreEl;
        this.timeEl = timeEl;
        this.missesEl = missesEl;

        this.gridSize = 3;
        this.duration = 60; // sekunder
        this.state = { score: 0, misses: 0, timeLeft: this.duration, running:false };

        this._tickId = null;
        this._spawnId = null;
        this._activeMoles = new Set();

        this.handleBoardClick = this.handleBoardClick.bind(this);
 }

 init() {
    this.createGrid(this.gridSize);
    this.updateHud();

    // Eventdelegering: en lyssnare hanterar alla barn-noder.
    this.boardEl.addEventListener('click', this.handleBoardClick);
    this.boardEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') this.handleBoardClick(e);
    });
 }

 createGrid(size = 3) {
    this.boardEl.innerHTML = '';
    for (let i = 0; i < size * size; i++) {
        const cell = document.createElement('button');
        cell.type = 'button';
        cell.className = 'cell';
        cell.setAttribute('aria-label', `Hål ${i + 1}`);
        this.boardEl.appendChild(cell);
    }
 }

 start() {
    if (this.state.running) return;
    this.state.running = true;
    this.state.score = 0;
    this.state.misses = 0;
    this.state.timeLeft = this.duration;
    this.updateHud();

    this._tickId = setInterval(() => {
      this.state.timeLeft--;
      this.updateHud();
      if (this.state.timeLeft <= 0) {
         this.state.running = false;
         clearInterval(this._tickId);
      }
    }, 1000);

    this._spawnId = setInterval(() => {
      if (!this.state.running) {
         clearInterval(this._spawnId);
         return;
      }

      this.spawnMole();

    }, 700);

    this.spawnMole();
 }

 reset() {
   clearInterval(this._tickId);
   clearInterval(this._spawnId);

   for (const mole of this._activeMoles) {
      mole.disappear();
   }

   this._activeMoles.clear();

   this.state.score = 0;
   this.state.misses = 0;
   this.state.timeLeft = this.duration;
   this.state.running = false;

   this.updateHud();
 }

 spawnMole() {
   const emptyCells = [...this.boardEl.querySelectorAll('.cell:not(.has-mole)')];
   const cell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
   const mole = new Mole(cell, 1000);
   this._activeMoles.add(mole);
   mole.appear(() => { 
      this._activeMoles.delete(mole);
      this.state.misses++; // räknas som miss
      this.updateHud(); // uppdatera texten
   });
 }

 handleBoardClick(e) {
    const cell = e.target.closest('.cell');
    if (!cell || !this.state.running) return;

    if (cell.classList.contains('has-mole')) {
      for (const mole of this._activeMoles) {
         if (mole.cellEl === cell) {
            mole.disappear();
            this._activeMoles.delete(mole);
            this.state.score++;
            this.updateHud();
            return;
         }
      }
    } else {
      this.state.misses++;
      this.updateHud();
    }
 }

 updateHud() {
    this.scoreEl.textContent = `Poäng: ${this.state.score}`;
    this.timeEl.textContent = `Tid: ${this.state.timeLeft}`;
    this.missesEl.textContent = `Missar: ${this.state.misses}`;
    }
}