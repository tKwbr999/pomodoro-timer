import { Pause, Play, RefreshCcw } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { ControlButton } from "./ControlButton";
import { ModeTypeButton } from "./ModeTypeButton";
import { TIMER_OPTIONS } from "../constants/index";
import useAudio from "../hooks/useAudio";

const Timer = () => {
  // 作業/休憩モード
  const [mode, setMode] = useState<"work" | "break">("work");
  // タイマーが動いているかどうか
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [now, setNow] = useState<number | null>(null);
  const [pausedTimeRemaining, setPausedTimeRemaining] = useState<number | null>(
    null
  );
  const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const { audioRef, playChime } = useAudio();
  // audio関連はhooksに切り出す
  //   const audioRef = useRef<AudioContext | null>(null);

  //   useEffect(() => {
  //     audioRef.current = window.AudioContext ? new window.AudioContext() : null;
  //     return () => {
  //       if (audioRef.current) {
  //         audioRef.current.close();
  //       }
  //     };
  //   }, []);

  //   const playBeep = (frequency: number, duration: number) => {
  //     if (!audioRef.current) return;
  //     const oscillator = audioRef.current.createOscillator();
  //     const gainNode = audioRef.current.createGain();

  //     oscillator.connect(gainNode);
  //     gainNode.connect(audioRef.current.destination);

  //     gainNode.gain.value = 0.5;
  //     oscillator.frequency.value = frequency;
  //     oscillator.start();

  //     setTimeout(() => {
  //       oscillator.stop();
  //     }, duration);
  //   };

  //   const playChime = () => {
  //     playBeep(523.25, 200); // C5: ド
  //     setTimeout(() => playBeep(659.25, 200), 200); // E5: ミ
  //     setTimeout(() => playBeep(783.99, 400), 400); // G5: ソ
  //   };

  // タイマー完了時の処理
  useEffect(() => {
    if (startTime && now) {
      const timePassed = now - startTime;
      const totalTime = TIMER_OPTIONS[mode].minutes * 60 * 1000;

      if (timePassed >= totalTime) {
        playChime();
        handleChangeMode();
        handleStart();
      }
    }
  }, [now, startTime, mode]);

  function handleStart() {
    if (audioRef.current) {
      // ユーザーの操作によって音が鳴るようにしないといけない
      audioRef.current.resume();
    }

    const currentTime = Date.now();
    // 停止中かつ、１時停止状態の場合
    if (!isRunning && pausedTimeRemaining) {
      setStartTime(currentTime - pausedTimeRemaining);
      setPausedTimeRemaining(null);
    } else {
      setStartTime(currentTime);
    }
    setNow(Date.now());
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    setIsRunning(true);
  }

  function handleStop() {
    // インターバル処理の停止
    clearInterval(intervalRef.current);
    // 作業中のフラグをfalse
    setIsRunning(false);

    // 停止された時点の経過時間を、pausedTimeRemainingに格納
    if (startTime != null && now != null) {
      // 停止した時点での経過時間
      setPausedTimeRemaining(now - startTime);
    }
  }

  function handleReset() {
    clearInterval(intervalRef.current);
    setStartTime(null);
    setNow(null);
    setIsRunning(false);
    setPausedTimeRemaining(null);
  }

  function handleChangeMode() {
    handleReset();
    setMode(mode === "work" ? "break" : "work");
  }

  // 経過時間(秒)
  const secondsPassed =
    startTime != null && now != null ? Math.floor((now - startTime) / 1000) : 0;
  // 残り時間の秒数（設定時間ー経過時間）
  const calculateTime = TIMER_OPTIONS[mode].minutes * 60 - secondsPassed;
  const displayMinutes = Math.floor(calculateTime / 60);
  const displaySeconds =
    calculateTime % 60 < 10 ? "0" + (calculateTime % 60) : calculateTime % 60;

  // ダミーコード
  //   const displayMinutes = "25";
  //   const displaySeconds = "00";
  //   const handleChangeMode = () => {};
  //   const handleStart = () => {};
  //   const handleStop = () => {};
  //   const handleReset = () => {};

  return (
    <div
      className={`flex justify-center rounded-xl p-4 bg-gradient-to-br w-[740px] mx-auto ${
        mode === "work"
          ? "from-amber-500 to-red-500"
          : "from-yellow-500 to-green-500"
      }`}
    >
      <div className="bg-zinc-700 space-y-12 rounded-xl w-full min-h-96 p-8">
        {/* モード切り替えボタン */}
        <div className="flex justify-center gap-4">
          {["work", "break"].map((modeType) => (
            <ModeTypeButton
              key={modeType}
              modeType={modeType as "work" | "break"}
              currentMode={mode}
              onClick={handleChangeMode}
            />
          ))}
        </div>

        <p className="text-center font-bold text-9xl font-mono text-zinc-100">
          {displayMinutes}:{displaySeconds}
        </p>

        {/* コントロールボタン */}
        <div className="flex gap-4 mb-6 justify-center">
          {!isRunning ? (
            <ControlButton onClick={handleStart} Icon={Play} />
          ) : (
            <ControlButton onClick={handleStop} Icon={Pause} />
          )}
          <ControlButton onClick={handleReset} Icon={RefreshCcw} />
        </div>
      </div>
    </div>
  );
};

export default Timer;
