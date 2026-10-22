<script lang="ts">
  import { onDestroy } from 'svelte';
  import { askAI } from '../ai/client';
  import { applyMove, createGame, isOver, previewValues, runeMod, score } from '../core/engine';
  import { cap } from '../lib/text';
  import {
    aiBoostPick, boostCard, newLog, opponentDeck, record, setupGame, summarize, tilesFor,
    type GameLog, type GameSetup, type MatchSummary,
  } from '../core/match';
  import { bondRecruits, prizeOptions, recruitsFromMatch, type Recruit } from '../core/progress';
  import { makeRng } from '../core/rng';
  import type { BoardSize, FlipCause, GameState, Move, Side } from '../core/types';
  import { BONDS } from '../data/bonds';
  import { CARD_BY_ID } from '../data/cards';
  import { OPPONENT_BY_ID } from '../data/opponents';
  import { dragToCell } from '../lib/drag';
  import { sfx, wait } from '../lib/fx';
  import { playMusic, stopMusic, syncMusic } from '../lib/music';
  import { go, type Screen } from '../stores/nav.svelte';
  import { activeDeck, addCard, ownedSet, persist, save } from '../stores/save.svelte';
  import { newSeed } from '../core/rng';
  import Avatar from './Avatar.svelte';
  import Board from './Board.svelte';
  import Card from './Card.svelte';
  import RuleChips from './RuleChips.svelte';

  let { opponent: oppId, mode, seed }: { opponent: string; mode: BoardSize; seed: number } = $props();

  // A duel is mounted once per match (keyed by seed), so plain constants are fine here.
  // svelte-ignore state_referenced_locally
  const opp = OPPONENT_BY_ID[oppId];
  // svelte-ignore state_referenced_locally
  const deck = [...activeDeck(mode)];
  // svelte-ignore state_referenced_locally
  const oppDeckIds = opponentDeck(opp, mode, seed);
  const bondName = (id: string) => BONDS.find((b) => b.id === id)?.name ?? id;

  type Phase = 'intro' | 'handicap' | 'play' | 'between' | 'result';
  let phase = $state<Phase>('intro');
  let gameNo = $state(0);
  // svelte-ignore state_referenced_locally
  let setup = $state.raw<GameSetup>(setupGame(opp, mode, deck, seed, 0));
  // svelte-ignore state_referenced_locally
  let game = $state.raw<GameState>(makeGame(setup));
  // svelte-ignore state_referenced_locally
  let log: GameLog = newLog(setup.first);
  const logs: GameLog[] = [];

  let selected = $state<number | null>(null);
  let aim = $state<number | null>(null);
  let hidden = $state<Record<number, Side>>({});
  let flipKeys = $state<Record<number, number>>({});
  let banner = $state<string | null>(null);
  let busy = $state(false);
  let lastPlaced = $state<number | null>(null);
  let hint = $state('');
  // Card being dragged from the hand: index, pointer position, and width for the floating copy.
  let drag = $state<{ i: number; x: number; y: number; w: number } | null>(null);
  let handEls: HTMLButtonElement[] = $state([]);

  let summary = $state<MatchSummary | null>(null);
  let joined = $state<Recruit[]>([]);
  let prizeChoices = $state<string[]>([]);
  let prizeDone = $state(true);

  let alive = true;
  playMusic();
  onDestroy(() => {
    alive = false;
    stopMusic();
  });

  function makeGame(s: GameSetup): GameState {
    let hands = s.hands;
    if (s.handicap === 1) hands = [hands[0], boostCard(hands[1], aiBoostPick(hands[1]))];
    return createGame({ size: mode, rules: opp.rules, tiles: tilesFor(opp, mode), hands, first: s.first, bonds: BONDS });
  }

  function begin() {
    playMusic(); // Retry here: "Begin" is a click, so the browser allows audio.
    if (setup.handicap === 0) {
      phase = 'handicap';
      return;
    }
    phase = 'play';
    next();
  }

  function chooseBoost(i: number) {
    game = { ...game, hands: [boostCard(game.hands[0], i), game.hands[1]] };
    phase = 'play';
    next();
  }

  function next() {
    if (isOver(game)) return endGame();
    if (game.turn === 1) runAI();
  }

  async function runAI() {
    busy = true;
    const t0 = performance.now();
    const move = await askAI(game, opp.difficulty, opp.personality, seed + gameNo * 1000 + game.moveNo * 31);
    if (!alive) return;
    const minWait = save.settings.skipAnimations ? 120 : 550;
    await wait(Math.max(0, minWait - (performance.now() - t0)));
    await play(move);
  }

  const LABEL: Record<FlipCause, string> = { basic: '', same: 'Same!', plus: 'Plus!', combo: 'Combo!', unite: 'Unite Attack!' };

  async function play(move: Move) {
    busy = true;
    const before = game;
    const r = applyMove(before, move, BONDS);
    record(log, before, move, r);
    selected = null;
    aim = null;
    hint = '';
    const hide: Record<number, Side> = {};
    for (const f of r.flips) hide[f.cell] ??= before.board[f.cell]!.owner;
    hidden = hide;
    game = r.state;
    lastPlaced = move.cell;
    sfx('place');

    const fast = save.settings.skipAnimations;
    if (r.sabotage && !fast) {
      await wait(150);
      banner = 'Sabotage!';
      sfx('sabotage');
      await wait(500);
      banner = null;
    }
    const steps = [...new Set(r.flips.map((f) => f.step))].sort((a, b) => a - b);
    for (const step of steps) {
      const group = r.flips.filter((f) => f.step === step);
      const special = group.find((f) => f.cause !== 'basic');
      if (!fast) await wait(step === 1 ? 200 : 280);
      if (!alive) return;
      if (special && !fast) {
        banner = special.cause === 'unite' && r.unite ? `Unite Attack · ${bondName(r.unite)}` : LABEL[special.cause];
        sfx(special.cause === 'basic' ? 'flip' : special.cause, step);
      }
      const h = { ...hidden };
      const k = { ...flipKeys };
      for (const f of group) {
        delete h[f.cell];
        k[f.cell] = (k[f.cell] ?? 0) + 1;
      }
      hidden = h;
      if (!fast) {
        flipKeys = k;
        if (!special) sfx(step > 1 ? 'combo' : 'flip', step);
      }
      if (special && !fast) {
        await wait(600);
        banner = null;
      }
    }
    if (!fast) await wait(r.flips.length ? 260 : 120);
    if (!alive) return;
    busy = false;
    next();
  }

  function endGame() {
    log.score = score(game);
    logs.push(log);
    // Best of two: you must win both games. After a game 1 draw or loss the match is already decided.
    if (opp.format === 'bo2' && gameNo === 0 && log.score[0] > log.score[1]) {
      phase = 'between';
      return;
    }
    finish();
  }

  function nextGame() {
    gameNo = 1;
    setup = setupGame(opp, mode, deck, seed, 1, logs[0].first);
    game = makeGame(setup);
    log = newLog(setup.first);
    hidden = {};
    flipKeys = {};
    lastPlaced = null;
    phase = 'intro';
  }

  function finish() {
    const s = summarize(opp, mode, deck, logs, seed);
    summary = s;
    save.stats.duels++;
    save.lastDuel = { opponent: opp.id, mode, seed, moves: logs.map((l) => l.moves) };
    if (s.won) {
      save.stats.wins++;
      save.beaten[opp.id] ??= { 3: 0, 4: 0 };
      save.beaten[opp.id][mode]++;
      const found = recruitsFromMatch(ownedSet(), s);
      for (const r of found) addCard(r.id, r.via);
      joined = found;
      const prize = prizeOptions(opp, oppDeckIds, ownedSet(), makeRng(seed + 99));
      if (prize.rule === 'choose' && prize.cards.length) {
        prizeChoices = prize.cards;
        prizeDone = false;
      } else if (prize.cards.length) {
        addCard(prize.cards[0], 'prize');
        joined = [...joined, { id: prize.cards[0], via: 'prize' }];
      }
      addBondRecruits();
    }
    persist();
    phase = 'result';
    sfx(s.won ? 'win' : s.draw ? 'draw' : 'lose');
  }

  function claim(id: string) {
    addCard(id, 'prize');
    joined = [...joined, { id, via: 'prize' }];
    prizeDone = true;
    addBondRecruits();
    persist();
  }

  /** Leave the result screen. An unclaimed prize goes to the strongest card, so the player is never stuck. */
  function leave(to: Screen) {
    if (!prizeDone && prizeChoices.length) {
      const sum = (id: string) => CARD_BY_ID[id].values.reduce((a, v) => a + v, 0);
      claim(prizeChoices.reduce((a, b) => (sum(b) > sum(a) ? b : a)));
    }
    go(to);
  }

  function addBondRecruits() {
    const b = bondRecruits(ownedSet());
    for (const r of b) addCard(r.id, 'bond');
    joined = [...joined, ...b];
  }

  // ---------- Player input ----------

  const myTurn = $derived(phase === 'play' && !busy && game.turn === 0);

  function selectCard(i: number) {
    if (phase === 'handicap') return chooseBoost(i);
    if (!myTurn) return;
    selected = selected === i ? null : i;
    hint = '';
    sfx('select');
  }

  function startDrag(i: number) {
    selected = i;
    aim = null;
    hint = '';
    drag = { i, x: -999, y: -999, w: handEls[i]?.getBoundingClientRect().width ?? 80 };
    sfx('select');
  }

  function dropDrag(i: number, cell: number | null) {
    drag = null;
    if (cell !== null && myTurn && !game.board[cell]) play({ hand: i, cell });
    else aim = null;
  }

  function pick(cell: number) {
    if (!myTurn || game.board[cell]) return;
    if (selected === null) {
      hint = 'Choose a card from your hand first.';
      return;
    }
    if (aim === cell) play({ hand: selected, cell });
    else aim = cell;
  }

  function onkey(e: KeyboardEvent) {
    if (phase === 'result' && e.key === 'Escape') return leave({ name: 'map' });
    if (e.key === 'Escape') {
      selected = null;
      aim = null;
      return;
    }
    const n = Number(e.key);
    if (n >= 1 && n <= game.hands[0].length && (myTurn || phase === 'handicap')) selectCard(n - 1);
  }

  const preview = $derived.by(() => {
    if (!myTurn || selected === null || aim === null || game.board[aim]) return null;
    const card = game.hands[0][selected];
    if (!card) return null;
    const r = applyMove(game, { hand: selected, cell: aim }, BONDS);
    return { r, id: card.id, base: card.values, values: previewValues(game, card, aim, 0) };
  });
  const marks = $derived(preview ? Object.fromEntries(preview.r.flips.map((f) => [f.cell, f.cause])) : {});
  const ghost = $derived(preview && aim !== null ? { cell: aim, id: preview.id, values: preview.values, base: preview.base } : null);

  const previewText = $derived.by(() => {
    if (!preview) return '';
    const { r } = preview;
    const counts: Record<string, number> = {};
    for (const f of r.flips) counts[f.cause] = (counts[f.cause] ?? 0) + 1;
    const parts = Object.entries(counts).filter(([c]) => c !== 'basic').map(([c, n]) => `${n} ${c}`);
    const tile = game.tiles[aim!];
    const extra: string[] = [];
    if (tile && game.rules.runes) {
      const card = game.hands[0][selected!];
      const mod = runeMod(card.rune, tile, card.ability);
      extra.push(`${cap(tile)} tile ${mod > 0 ? `+${mod}` : mod < 0 ? `−${-mod}` : '±0'}`);
    }
    if (r.bonds.length) extra.push(`bond: ${r.bonds.map(bondName).join(', ')}`);
    if (r.unite) extra.push(`Unite Attack: ${bondName(r.unite)}`);
    if (r.sabotage) extra.push(`Sabotage −1 on ${CARD_BY_ID[game.board[r.sabotage.cell]!.card.id].name}`);
    const main = r.flips.length ? `Captures ${r.flips.length}${parts.length ? ` (${parts.join(', ')})` : ''}` : 'No captures';
    return [main, ...extra].join(' · ') + (drag ? '. Release to place.' : '. Tap again to place.');
  });

  const shownOwner = (cell: number): Side => hidden[cell] ?? game.board[cell]?.owner ?? 0;
  const live = $derived.by(() => {
    const sc: [number, number] = [0, 0];
    game.board.forEach((p, i) => { if (p) sc[shownOwner(i)]++; });
    return [sc[0] + game.hands[0].length, sc[1] + game.hands[1].length];
  });

  const statusText = $derived.by(() => {
    if (phase === 'handicap') return 'Parity handicap: choose one card to get +1 on all sides.';
    if (phase !== 'play') return '';
    if (hint) return hint;
    if (busy && game.turn === 1) return `${opp.name} is thinking…`;
    if (busy) return '';
    if (preview) return previewText;
    if (drag) return 'Drop the card on an empty cell.';
    if (selected !== null) return 'Choose a cell. Flips show before you confirm.';
    return 'Your turn. Drag a card to the board, or tap a card, then a cell.';
  });

  const outcome = $derived(summary ? (summary.won ? 'Victory' : summary.draw ? 'Draw' : 'Defeat') : '');
  const viaLabel: Record<string, string> = { prize: 'Prize', quest: 'Recruited', bond: 'Bond recruit', story: 'Story' };
</script>

<svelte:window onkeydown={onkey} />

<div class="duel s{mode}">
  <header class="bar">
    <button class="btn small" onclick={() => go({ name: 'map' })} aria-label="Leave duel">✕</button>
    <Avatar file={opp.portrait} size={40} boss={opp.boss} />
    <div class="who">
      <strong>{opp.name}</strong>
      <span class="muted small">{opp.title}{opp.format === 'bo2' ? ` · Game ${gameNo + 1} of 2` : ''}</span>
    </div>
  </header>

  <div class="side opp-side">
    <div class="score p1s" aria-label="Opponent score {live[1]}">◆ {live[1]}</div>
    <div class="opp-hand" aria-label="Opponent hand, {game.hands[1].length} cards">
      {#each game.hands[1] as c (c.uid)}
        <div class="mini"><Card id={c.id} faceDown /></div>
      {/each}
    </div>
  </div>

  <div class="center">
    <Board
      {game}
      {shownOwner}
      {flipKeys}
      {ghost}
      {marks}
      {lastPlaced}
      interactive={myTurn}
      onpick={pick}
      onaim={(c) => myTurn && selected !== null && (aim = c)}
    />
    {#if banner}<div class="banner" role="status">{banner}</div>{/if}
  </div>

  <p class="status" aria-live="polite">{statusText}</p>

  <div class="side my-side">
    <div class="score p0s" aria-label="Your score {live[0]}">● {live[0]}</div>
    <div class="my-hand" class:boosting={phase === 'handicap'} role="listbox" aria-label="Your hand">
      {#each game.hands[0] as c, i (c.uid)}
        <button
          bind:this={handEls[i]}
          class="hand-card"
          class:sel={selected === i}
          class:lifted={drag?.i === i}
          use:dragToCell={{
            enabled: () => myTurn,
            start: () => startDrag(i),
            move: (x, y, cell) => {
              if (drag) drag = { ...drag, x, y };
              aim = cell;
            },
            drop: (cell) => dropDrag(i, cell),
          }}
          role="option"
          aria-selected={selected === i}
          disabled={!(myTurn || phase === 'handicap')}
          onclick={() => selectCard(i)}
        >
          <Card id={c.id} boost={c.boost} owner={0} selected={selected === i} />
          <span class="key" aria-hidden="true">{i + 1}</span>
        </button>
      {/each}
    </div>
  </div>

  {#if drag && drag.x > -999}
    {@const c = game.hands[0][drag.i]}
    <div class="drag-ghost" style="left:{drag.x}px; top:{drag.y}px; width:{drag.w}px" aria-hidden="true">
      <Card id={c.id} boost={c.boost} owner={0} />
    </div>
  {/if}

  <footer class="bar foot">
    <RuleChips rules={opp.rules} />
    <button
      class="btn small sound"
      onclick={() => { save.settings.sound = !save.settings.sound; persist(); sfx('click'); }}
      aria-pressed={save.settings.sound}
      aria-label="Sound effects"
    >{save.settings.sound ? '🔊' : '🔇'}</button>
    <button
      class="btn small music"
      class:off={!save.settings.music}
      onclick={() => { save.settings.music = !save.settings.music; persist(); syncMusic(); }}
      aria-pressed={save.settings.music}
      aria-label="Music"
    >🎵</button>
  </footer>

  {#if phase === 'intro'}
    <div class="overlay">
      <div class="panel dialog stack">
        <h2>{gameNo === 0 ? opp.name : 'Game 2'}</h2>
        {#if gameNo === 0}<p class="muted">{opp.intro}</p>{/if}
        <p><strong>Coin flip:</strong> {setup.first === 0 ? 'You go first.' : `${opp.name} goes first.`}</p>
        {#if gameNo === 1}<p class="muted small">The first player switches. Win this game to win the match.</p>{/if}
        {#if setup.handicap === 0}
          <p class="small">Parity handicap: you will boost one card by +1.</p>
        {:else if setup.handicap === 1}
          <p class="small">Parity handicap: {opp.name} boosts one card by +1.</p>
        {/if}
        <RuleChips rules={opp.rules} showOff />
        <p class="muted small">Rune tiles are on the board. Matching rune: +1. Other rune: −1.</p>
        <button class="btn primary" onclick={begin}>Begin</button>
      </div>
    </div>
  {:else if phase === 'between'}
    <div class="overlay">
      <div class="panel dialog stack">
        <h2>You won game 1</h2>
        <p>You {logs[0].score[0]} – {logs[0].score[1]} {opp.name}</p>
        <p class="muted small">Win game 2 too, and the match is yours. The first player switches.</p>
        <button class="btn primary" onclick={nextGame}>Play game 2</button>
      </div>
    </div>
  {:else if phase === 'result' && summary}
    <div class="overlay">
      <div class="panel dialog stack result">
        <h1 class="outcome {outcome.toLowerCase()}">{outcome}</h1>
        <p>
          {#each summary.games as g, i}
            <span class="chip">Game {i + 1}: {g.score[0]} – {g.score[1]}</span>
          {/each}
        </p>
        <div class="mini-board"><Board {game} /></div>
        <ul class="facts small">
          <li>Most flips in one move: {summary.flipsMax}</li>
          {#if summary.bonds.length}<li>Bonds triggered: {summary.bonds.map(bondName).join(', ')}</li>{/if}
          {#if summary.unite}<li>Unite Attack used</li>{/if}
          {#if summary.flawless && summary.won}<li>Flawless: no card lost</li>{/if}
        </ul>

        {#if !prizeDone}
          <h3>Choose a prize</h3>
          <p class="muted small">Tap a card to keep it. If you leave now, you get the strongest one.</p>
          <div class="grid">
            {#each prizeChoices as id}
              <button class="pick" onclick={() => claim(id)}><Card {id} showName /></button>
            {/each}
          </div>
        {/if}

        {#if joined.length}
          <h3>New Stars</h3>
          <div class="grid">
            {#each joined as r}
              <div><Card id={r.id} showName /><div class="via">{viaLabel[r.via]}</div></div>
            {/each}
          </div>
        {:else if summary.won && prizeDone}
          <p class="muted small">No new cards this time. You already own every card this opponent carries.</p>
        {/if}

        <p class="muted small">Seed {summary.seed}</p>
        <div class="row actions">
          <button class="btn primary" onclick={() => leave({ name: 'duel', opponent: opp.id, mode, seed: newSeed() })}>Rematch</button>
          <button class="btn" onclick={() => leave({ name: 'map' })}>Map</button>
          <button class="btn" onclick={() => leave({ name: 'decks', mode })}>Decks</button>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .duel {
    display: grid;
    grid-template-areas: 'head' 'opp' 'board' 'status' 'hand' 'foot';
    gap: 8px;
    max-width: 560px;
    margin: 0 auto;
    padding: 8px 16px calc(12px + env(safe-area-inset-bottom));
  }
  .bar { grid-area: head; display: flex; align-items: center; gap: 10px; }
  .foot { grid-area: foot; justify-content: space-between; }
  .sound { margin-left: auto; min-width: 44px; }
  .music { min-width: 44px; }
  .music.off { opacity: 0.4; text-decoration: line-through; }
  .who { flex: 1; display: flex; flex-direction: column; line-height: 1.2; min-width: 0; }
  .score {
    font-weight: 800; font-size: 1.4rem; min-width: 64px; text-align: center;
    border-radius: 999px; padding: 2px 12px; font-variant-numeric: tabular-nums;
  }
  .p0s { background: var(--p0-deep); color: #cfe2ff; border: 2px solid var(--p0); }
  .p1s { background: var(--p1-deep); color: #ffe0c2; border: 2px dashed var(--p1); }

  .opp-side { grid-area: opp; display: flex; align-items: center; justify-content: center; gap: 12px; }
  .opp-hand { display: flex; gap: 4px; justify-content: center; }
  .my-side { grid-area: hand; display: flex; flex-direction: column; gap: 6px; }
  .my-side .score { align-self: center; }
  .mini { width: 30px; }

  .center { grid-area: board; position: relative; }
  .banner {
    position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);
    font-family: var(--font-title); font-size: clamp(1.8rem, 9vw, 3rem); font-weight: 800;
    color: var(--gold-2); white-space: nowrap; pointer-events: none;
    text-shadow: 0 0 18px rgb(0 0 0), 0 2px 0 #6d4b12, 0 0 30px rgb(217 180 91 / 0.6);
    animation: pop 600ms cubic-bezier(0.2, 0.9, 0.3, 1.3);
  }
  @keyframes pop {
    from { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
    to { transform: translate(-50%, -50%) scale(1); opacity: 1; }
  }

  .status { grid-area: status; min-height: 2.6em; margin: 0; text-align: center; font-size: 0.9rem; color: var(--muted); }

  .my-hand { display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; }
  .s4 .my-hand { grid-template-columns: repeat(4, 1fr); }
  .my-hand.boosting .hand-card { animation: glow 1.2s ease-in-out infinite alternate; border-radius: 10px; }
  @keyframes glow { from { box-shadow: 0 0 0 0 transparent; } to { box-shadow: 0 0 0 3px var(--gold); } }
  .hand-card { position: relative; padding: 0; border: 0; background: none; min-height: var(--tap); touch-action: none; }
  .hand-card.lifted { opacity: 0.3; }
  .drag-ghost {
    position: fixed; z-index: 30; pointer-events: none;
    transform: translate(-50%, -60%) scale(1.1) rotate(-3deg);
    filter: drop-shadow(0 12px 18px rgb(0 0 0 / 0.6));
  }
  .hand-card:disabled { cursor: default; }
  .hand-card:disabled :global(.card) { filter: saturate(0.7) brightness(0.85); }
  .key {
    position: absolute; bottom: -4px; right: -2px; font-size: 0.65rem; color: var(--muted);
    background: var(--bg); border: 1px solid var(--line); border-radius: 4px; padding: 0 4px;
  }
  @media (hover: none) { .key { display: none; } }

  .overlay {
    position: fixed; inset: 0; z-index: 20; display: grid; place-items: center; padding: 16px;
    background: rgb(10 8 6 / 0.72); backdrop-filter: blur(2px);
    animation: fade 180ms ease-out;
  }
  @keyframes fade { from { opacity: 0; } }
  .dialog { width: min(100%, 460px); max-height: 92dvh; overflow: auto; }
  .outcome { font-size: 2.2rem; margin: 0; }
  .outcome.victory { color: var(--gold-2); }
  .outcome.defeat { color: var(--danger); }
  .mini-board { max-width: 220px; margin: 0 auto; width: 100%; }
  .facts { margin: 0; padding-left: 1.2em; color: var(--muted); }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(84px, 1fr)); gap: 10px; }
  .pick { padding: 0; border: 0; background: none; }
  /* Pinned to the bottom of the dialog, so the exits are always visible. */
  .actions {
    position: sticky; bottom: -16px; margin: 0 -16px -16px; padding: 12px 16px 16px;
    background: linear-gradient(transparent, var(--panel) 30%);
  }
  .via { text-align: center; font-size: 0.7rem; color: var(--gold); font-weight: 700; text-transform: uppercase; }

  @media (min-width: 960px) {
    .duel {
      max-width: 1100px;
      grid-template-columns: 200px 1fr 260px;
      grid-template-areas:
        'head head head'
        'opp board hand'
        'opp status hand'
        'foot foot foot';
      align-items: start;
    }
    .side { flex-direction: column; align-items: center; gap: 12px; padding-top: 12px; }
    .my-side { align-items: stretch; }
    .opp-hand { flex-direction: column; align-items: center; }
    .mini { width: 64px; }
    .my-hand, .s4 .my-hand { grid-template-columns: repeat(2, 1fr); }
  }
</style>
