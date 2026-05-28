import { delay } from "../../../../shared/domain/utils/delay";
import { GameEffectsManager, type GameEffectsCallbacks } from "../../domain/models/GameEffects";
import confetti from "canvas-confetti";

export const GAME_EFFECTS_CONFIG = {
  audio: {
    cardFlip: {
      type: "sine" as OscillatorType,
      freqStart: 300,
      freqEnd: 600,
      gainStart: 0.3,
      duration: 0.1,
    },
    matchSuccess: {
      type: "triangle" as OscillatorType,
      note1: {
        freq: 523.25,
        delay: 0.0,
        duration: 0.06,
      },
      note2: {
        freq: 783.99,
        delay: 0.0,
        duration: 0.35,
      },
      interNoteDelay: 45,
    },
    matchError: {
      type: "sawtooth" as OscillatorType,
      freqStart: 180,
      freqEnd: 70,
      gainStart: 0.2,
      duration: 0.3,
    },
    common: {
      gainEnd: 0.0001,
      toneGainStart: 0.2,
    },
  },

  haptics: {
    shakePattern: [100, 50, 100],
    shakeDuration: 400,
  },
} as const;

export class HTML5GameEffectsManager extends GameEffectsManager {
  private audioContext: AudioContext | null = null;
  private isTriggeringCelebration = false;
  private celebrationAudio: HTMLAudioElement | undefined;
  private buttonPressAudio: HTMLAudioElement | undefined;
  private bebetonGif: HTMLImageElement | undefined;

  constructor(protected callbacks?: GameEffectsCallbacks) {
    super(callbacks);
    this.loadAssets();
  }

  private async loadAssets() {
    const celebrationAudio = await import("./assets/audio/celebration.mp3");
    const buttonPressAudio = await import("./assets/audio/button-press.wav");
    const bebetonGif = await import("./assets/images/bebeton.gif");

    this.bebetonGif = new Image();
    this.bebetonGif.src = bebetonGif.default;
    this.celebrationAudio = new Audio(celebrationAudio.default);
    this.buttonPressAudio = new Audio(buttonPressAudio.default);

    try {
      await Promise.all([this.celebrationAudio?.load(), this.buttonPressAudio?.load()]);
    } catch (error) {
      console.error("Error loading audio assets:", error);
    }
  }

  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;

    if (!this.audioContext) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioContext = new AudioContextClass();
      }
    }

    if (this.audioContext && this.audioContext.state === "suspended") {
      this.audioContext.resume();
    }

    return this.audioContext;
  }

  public async playCardFlip(): Promise<void> {
    const context = this.getContext();
    if (!context) return;

    const config = GAME_EFFECTS_CONFIG.audio.cardFlip;
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.type = config.type;
    oscillator.frequency.setValueAtTime(config.freqStart, context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(config.freqEnd, context.currentTime + config.duration);

    gainNode.gain.setValueAtTime(config.gainStart, context.currentTime);

    gainNode.gain.exponentialRampToValueAtTime(
      GAME_EFFECTS_CONFIG.audio.common.gainEnd,
      context.currentTime + config.duration,
    );

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + config.duration);
  }

  public async playMatchSuccess(): Promise<void> {
    const context = this.getContext();
    if (!context) return;

    const config = GAME_EFFECTS_CONFIG.audio.matchSuccess;

    this.createTone({
      context,
      type: config.type,
      frequency: config.note1.freq,
      startDelay: config.note1.delay,
      duration: config.note1.duration,
    });

    await delay(config.interNoteDelay);

    this.createTone({
      context,
      type: config.type,
      frequency: config.note2.freq,
      startDelay: config.note2.delay,
      duration: config.note2.duration,
    });
  }

  public async playMatchError(): Promise<void> {
    const context = this.getContext();
    if (!context) return;

    const config = GAME_EFFECTS_CONFIG.audio.matchError;
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.type = config.type;

    oscillator.frequency.setValueAtTime(config.freqStart, context.currentTime);
    oscillator.frequency.linearRampToValueAtTime(config.freqEnd, context.currentTime + config.duration);

    gainNode.gain.setValueAtTime(config.gainStart, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      GAME_EFFECTS_CONFIG.audio.common.gainEnd,
      context.currentTime + config.duration,
    );

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + config.duration);
  }

  public async shakeBoard(): Promise<void> {
    const config = GAME_EFFECTS_CONFIG.haptics;

    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(config.shakePattern as unknown as number[]);
    }

    this.callbacks?.onBoardShake(true);
    await delay(config.shakeDuration);
    this.callbacks?.onBoardShake(false);
  }

  public async triggerCelebration() {
    if (!this.celebrationAudio || this.isTriggeringCelebration) {
      return;
    }

    this.isTriggeringCelebration = true;
    this.celebrationAudio.currentTime = 0;
    this.celebrationAudio.play();

    const DURATION_DELAY_MS = 4000;

    this.startStrobeEffect(DURATION_DELAY_MS);

    confetti({
      particleCount: 500,
      spread: 360,
      origin: { y: 0.5 },
    });

    await delay(DURATION_DELAY_MS);

    this.isTriggeringCelebration = false;
  }

  public async playButtonPress(): Promise<void> {
    if (!this.buttonPressAudio) {
      return;
    }

    this.buttonPressAudio.currentTime = 0;
    this.buttonPressAudio.play();
  }

  private async startStrobeEffect(duration: number) {
    if (!this.bebetonGif) {
      return;
    }

    const overlay = document.createElement("div");

    Object.assign(overlay.style, {
      position: "fixed",
      top: "0",
      left: "0",
      width: "100vw",
      height: "100vh",
      zIndex: "999999",
      pointerEvents: "none",
      opacity: "0.2",
      backgroundImage: this.bebetonGif ? `url(${this.bebetonGif.src})` : undefined,
      backgroundSize: "100% 100%",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
    });

    const styleId = "strobe-style";

    if (!document.getElementById(styleId)) {
      const styleSheet = document.createElement("style");
      styleSheet.id = styleId;
      styleSheet.innerText = `
      @keyframes strobe {
        0% { background-color: red; }
        25% { background-color: blue; }
        50% { background-color: lime; }
        75% { background-color: yellow; }
        100% { background-color: red; }
      }
    `;
      document.head.appendChild(styleSheet);
    }

    overlay.style.animation = "strobe 0.1s infinite";
    document.body.appendChild(overlay);

    await delay(duration);
    overlay.remove();
  }

  private createTone(config: {
    context: AudioContext;
    type: OscillatorType;
    frequency: number;
    startDelay: number;
    duration: number;
  }) {
    const { context, type, frequency, startDelay, duration } = config;

    const startTime = context.currentTime + startDelay;
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, startTime);

    gainNode.gain.setValueAtTime(GAME_EFFECTS_CONFIG.audio.common.toneGainStart, startTime);
    gainNode.gain.exponentialRampToValueAtTime(GAME_EFFECTS_CONFIG.audio.common.gainEnd, startTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
  }
}
