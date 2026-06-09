import { AnimatePresence, motion } from 'framer-motion';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { importantAccents, TARGET_RACE_DATE, trainingPlan } from './data/trainingPlan';
import { formatDuration, formatPace, getDaysLeft, getPace, getProgressStats, parseDurationToMinutes } from './lib/metrics';
import { createProfile, storage } from './lib/storage';
import type { ProgressByProfile, TrainingDay, UserProfile, ViewName, WorkoutEntry } from './types';

const springTap = { scale: 0.94, y: 2 };
const appear = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 }
};

const ADMIN_LOGIN = 'admin_luna_26';
const ADMIN_PASSWORD = 'RunPixel!620';


function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

function PixelButton({
  children,
  onClick,
  type = 'button',
  variant = 'pink',
  className = '',
  disabled = false,
  ariaLabel
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  variant?: 'pink' | 'mint' | 'lemon' | 'sky' | 'cream' | 'danger';
  className?: string;
  disabled?: boolean;
  ariaLabel?: string;
}) {
  const variants: Record<string, string> = {
    pink: 'bg-candy text-white',
    mint: 'bg-mint text-cocoa',
    lemon: 'bg-lemon text-cocoa',
    sky: 'bg-sky text-cocoa',
    cream: 'bg-cream text-cocoa',
    danger: 'bg-[#ff7c91] text-white'
  };

  return (
    <motion.button
      type={type}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onClick}
      whileHover={{ y: -2, transition: { duration: 0.22, ease: 'easeOut' } }}
      whileTap={springTap}
      className={cn(
        'pixel-border rounded-2xl px-4 py-3 text-center font-cute text-[13px] uppercase tracking-wide transition disabled:cursor-not-allowed disabled:opacity-50',
        variants[variant],
        className
      )}
    >
      {children}
    </motion.button>
  );
}

function ScreenFrame({ children, footer }: { children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <main className="relative mx-auto min-h-screen w-full max-w-[520px] px-4 py-4 text-cocoa sm:py-6">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 5, repeat: Infinity }} className="cloud absolute left-5 top-20 opacity-80" />
        <motion.div animate={{ rotate: [0, 12, 0] }} transition={{ duration: 3.5, repeat: Infinity }} className="pixel-star absolute right-8 top-28" />
        <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 4.2, repeat: Infinity }} className="pixel-heart absolute bottom-24 left-7 opacity-90" />
      </div>

      <motion.section
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="phone-shell relative overflow-hidden rounded-[34px] bg-[#ffb8d0] p-3"
      >
        <div className="flex items-center justify-between px-3 pb-3 pt-1 font-cute text-[11px] text-cocoa">
          <span>9:41</span>
          <span className="flex items-center gap-2">
            <span className="pixel-star h-4 w-4" /> RUN PET
          </span>
          <span>♡♡</span>
        </div>
        <div className="lcd-screen soft-grid relative min-h-[calc(100vh_-_128px)] overflow-hidden rounded-[27px] bg-cream p-4 sm:min-h-[760px] sm:p-5">
          <div className="absolute right-4 top-4 flex gap-2">
            <span className="h-3 w-3 rounded-full border-2 border-cocoa bg-candy" />
            <span className="h-3 w-3 rounded-full border-2 border-cocoa bg-lemon" />
            <span className="h-3 w-3 rounded-full border-2 border-cocoa bg-mint" />
          </div>
          {children}
        </div>
      </motion.section>
      {footer}
    </main>
  );
}

function KawaiiMascot({ mood = 'happy' }: { mood?: 'happy' | 'race' | 'sleep' }) {
  return (
    <motion.div
      animate={{ y: [0, -5, 0] }}
      transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
      className="tamagotchi-face mx-auto flex h-[118px] w-[142px] items-end justify-center rounded-[38px] border-4 border-cocoa bg-[#fffdf4] shadow-[0_8px_0_#6b3f55]"
      aria-hidden
    >
      <div className="mb-7 flex flex-col items-center">
        <div className="h-2 w-7 rounded-full bg-cocoa" />
        <div className="mt-3 font-pixel text-[10px] text-candy">{mood === 'race' ? 'GO!' : mood === 'sleep' ? 'ZZ' : 'HI'}</div>
      </div>
      <div className="absolute -left-3 top-6 h-10 w-10 rounded-full border-4 border-cocoa bg-blush" />
      <div className="absolute -right-3 top-6 h-10 w-10 rounded-full border-4 border-cocoa bg-blush" />
      <div className="absolute -bottom-3 left-9 h-7 w-8 rounded-xl border-4 border-cocoa bg-mint" />
      <div className="absolute -bottom-3 right-9 h-7 w-8 rounded-xl border-4 border-cocoa bg-mint" />
    </motion.div>
  );
}

function Keypad({ value, onChange, onEnter }: { value: string; onChange: (value: string) => void; onEnter: () => void }) {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '⌫', '0', 'OK'];
  const handleKey = (key: string) => {
    if (key === '⌫') return onChange(value.slice(0, -1));
    if (key === 'OK') return onEnter();
    if (value.length < 12) onChange(value + key);
  };

  return (
    <div className="grid grid-cols-3 gap-3">
      {keys.map((key) => (
        <motion.button
          key={key}
          type="button"
          whileTap={{ scale: 0.88, rotate: key === 'OK' ? 2 : -2 }}
          whileHover={{ y: -2 }}
          onClick={() => handleKey(key)}
          className={cn(
            'rounded-2xl border-[3px] border-cocoa px-2 py-3 font-pixel text-[13px] shadow-[0_5px_0_#6b3f55] transition active:translate-y-1 active:shadow-[0_2px_0_#6b3f55]',
            key === 'OK' ? 'bg-mint' : key === '⌫' ? 'bg-lemon' : 'bg-white'
          )}
        >
          {key}
        </motion.button>
      ))}
    </div>
  );
}

function LoginScreen({
  profiles,
  onLogin,
  onOpenAdmin
}: {
  profiles: UserProfile[];
  onLogin: (profile: UserProfile) => void;
  onOpenAdmin: () => void;
}) {
  const [pin, setPin] = useState('');
  const [message, setMessage] = useState('');

  const enter = () => {
    const profile = profiles.find((item) => item.pin === pin);
    if (profile) {
      setMessage('');
      onLogin(profile);
      return;
    }

    setMessage(profiles.length ? 'PIN не найден. Попробуй ещё раз ♡' : 'Профиль ещё не создан. Зайди как админ и добавь его ✦');
    setPin('');
  };

  return (
    <ScreenFrame>
      <motion.div variants={appear} initial="hidden" animate="visible" className="relative z-10 mx-auto max-w-[430px] pt-7">
        <div className="mb-4 text-center">
          <p className="font-cute text-[12px] uppercase tracking-wider text-berry">Tamagotchi care</p>
          <h1 className="mt-2 font-pixel text-[21px] leading-[1.55] text-cocoa">RUN PET</h1>
          <p className="mx-auto mt-2 max-w-[290px] font-round text-2xl leading-6 text-cocoa/80">
            Милый трекер подготовки к забегу 20 июня
          </p>
        </div>

        <KawaiiMascot />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="pixel-window mt-7 rounded-[28px] bg-lemon/90 p-4"
        >
          <div className="rounded-2xl border-[3px] border-cocoa bg-sky px-3 py-3 text-center">
            <p className="font-cute text-[11px] uppercase">Введи свой PIN</p>
            <div className="mt-3 min-h-[32px] font-pixel text-[18px] tracking-[8px] text-berry">
              {pin ? '•'.repeat(pin.length) : '♡ ♡ ♡'}
            </div>
          </div>

          <div className="mt-4">
            <Keypad value={pin} onChange={setPin} onEnter={enter} />
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3">
            <PixelButton onClick={enter} variant="mint" className="w-full">войти</PixelButton>
            <button
              type="button"
              onClick={onOpenAdmin}
              className="w-full rounded-2xl border-[3px] border-cocoa bg-white/70 px-4 py-3 font-cute text-[11px] uppercase text-berry shadow-[0_5px_0_#6b3f55]"
            >
              вход для админа
            </button>
          </div>

          {message && (
            <p className="mt-4 rounded-2xl border-[3px] border-cocoa bg-cream px-3 py-2 text-center font-round text-2xl leading-6">
              {message}
            </p>
          )}
        </motion.div>
      </motion.div>
    </ScreenFrame>
  );
}

function AdminLoginScreen({ onSuccess, onBack }: { onSuccess: () => void; onBack: () => void }) {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (login.trim() === ADMIN_LOGIN && password === ADMIN_PASSWORD) {
      setMessage('');
      setPassword('');
      onSuccess();
      return;
    }
    setMessage('Неверный логин или пароль');
    setPassword('');
  };

  return (
    <ScreenFrame footer={<BackButton onClick={onBack} label="назад" />}>
      <motion.form
        onSubmit={submit}
        variants={appear}
        initial="hidden"
        animate="visible"
        className="relative z-10 mx-auto max-w-[430px] pt-8"
      >
        <div className="pixel-window rounded-[28px] bg-lemon/95 p-4">
          <p className="font-cute text-[12px] uppercase text-berry">admin / login</p>
          <h1 className="mt-2 font-pixel text-[18px] leading-[1.6]">Вход в админку</h1>
          <p className="mt-2 font-round text-2xl leading-6 text-cocoa/80">
            Здесь создаются профили. Данные доступа на экране не показываются.
          </p>

          <label className="mt-5 block font-cute text-[12px] uppercase">Логин</label>
          <input
            value={login}
            onChange={(event) => setLogin(event.target.value)}
            className="pixel-input mt-2 w-full rounded-2xl px-4 py-3 font-round text-2xl"
            placeholder="admin login"
            autoComplete="username"
          />

          <label className="mt-4 block font-cute text-[12px] uppercase">Пароль</label>
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            className="pixel-input mt-2 w-full rounded-2xl px-4 py-3 font-round text-2xl"
            placeholder="••••••••"
            autoComplete="current-password"
          />

          <PixelButton type="submit" className="mt-5 w-full" variant="mint">открыть бэк</PixelButton>

          {message && (
            <p className="mt-4 rounded-2xl border-[3px] border-cocoa bg-blush px-3 py-2 text-center font-round text-2xl">
              {message}
            </p>
          )}
        </div>
      </motion.form>
    </ScreenFrame>
  );
}

function ProfileManager({
  profiles,
  onCreate,
  onDelete,
  onBack
}: {
  profiles: UserProfile[];
  onCreate: (name: string, pin: string) => void;
  onDelete: (id: string) => void;
  onBack: () => void;
}) {
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [message, setMessage] = useState('');

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (name.trim().length < 2 || pin.length < 3) {
      setMessage('Имя от 2 букв, PIN от 3 цифр');
      return;
    }
    if (profiles.some((profile) => profile.pin === pin)) {
      setMessage('Такой PIN уже занят');
      return;
    }
    onCreate(name, pin);
    setName('');
    setPin('');
    setMessage('Профиль создан ✿');
  };

  return (
    <ScreenFrame footer={<BackButton onClick={onBack} label="назад ко входу" />}>
      <div className="pt-8">
        <div className="pixel-window rounded-[26px] bg-white/90 p-4">
          <p className="font-cute text-[12px] uppercase text-berry">admin mode</p>
          <h1 className="mt-2 font-pixel text-[18px] leading-[1.6]">Профили</h1>
          <p className="mt-2 font-round text-2xl leading-6 text-cocoa/80">Создай имя и PIN. Потом человек входит по PIN, а имя сразу отображается на платформе.</p>
        </div>

        <form onSubmit={submit} className="pixel-window mt-5 rounded-[26px] bg-blush/80 p-4">
          <label className="block font-cute text-[12px] uppercase">Имя</label>
          <input className="pixel-input mt-2 w-full rounded-2xl px-4 py-3 font-round text-2xl" value={name} onChange={(event) => setName(event.target.value)} placeholder="имя девушки" />
          <label className="mt-4 block font-cute text-[12px] uppercase">PIN</label>
          <input className="pixel-input mt-2 w-full rounded-2xl px-4 py-3 font-round text-2xl" value={pin} inputMode="numeric" onChange={(event) => setPin(event.target.value.replace(/\D/g, '').slice(0, 12))} placeholder="например 1234" />
          <PixelButton type="submit" className="mt-5 w-full" variant="mint">создать профиль</PixelButton>
          {message && <p className="mt-4 rounded-2xl border-[3px] border-cocoa bg-cream px-3 py-2 text-center font-round text-2xl">{message}</p>}
        </form>

        <div className="mt-6 space-y-3 pb-24">
          {profiles.map((profile, index) => (
            <motion.div
              key={profile.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="pixel-window flex items-center justify-between gap-3 rounded-[24px] bg-white/90 p-4"
            >
              <div>
                <p className="font-pixel text-[12px] leading-5">{profile.name}</p>
                <p className="mt-1 font-round text-xl text-cocoa/70">PIN: {'•'.repeat(profile.pin.length)}</p>
              </div>
              <PixelButton variant="danger" onClick={() => onDelete(profile.id)} className="!px-3 !py-2 text-[10px]">удалить</PixelButton>
            </motion.div>
          ))}
        </div>
      </div>
    </ScreenFrame>
  );
}

function MiniPaceChart({ values }: { values: number[] }) {
  if (values.length < 2) {
    return (
      <div className="flex h-[46px] items-center justify-center rounded-2xl border-[3px] border-dashed border-cocoa/50 bg-white/55 font-cute text-[10px] text-cocoa/60">
        график появится после 2 бегов
      </div>
    );
  }

  const width = 168;
  const height = 46;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const points = values
    .map((value, index) => {
      const x = values.length === 1 ? 0 : (index / (values.length - 1)) * width;
      const y = 6 + ((value - min) / range) * (height - 12);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-[46px] w-full rounded-2xl border-[3px] border-cocoa bg-white/70 p-1" role="img" aria-label="Мини-график темпа">
      <polyline fill="none" stroke="#d95c8a" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" points={points} />
      {values.map((value, index) => {
        const x = values.length === 1 ? 0 : (index / (values.length - 1)) * width;
        const y = 6 + ((value - min) / range) * (height - 12);
        return <circle key={`${value}-${index}`} cx={x} cy={y} r="4" fill="#ffe98f" stroke="#6b3f55" strokeWidth="3" />;
      })}
    </svg>
  );
}

function HomeScreen({
  profile,
  entries,
  onPlan,
  onAdmin,
  onLogout
}: {
  profile: UserProfile;
  entries: Record<string, WorkoutEntry>;
  onPlan: () => void;
  onAdmin: () => void;
  onLogout: () => void;
}) {
  const stats = useMemo(() => getProgressStats(entries), [entries]);
  const daysLeft = getDaysLeft();
  const completionPercent = Math.round((stats.completed / stats.total) * 100);
  const trendText = stats.trend === undefined ? 'пока ждём данные' : stats.trend > 0 ? `быстрее на ${formatDuration(stats.trend)}/км` : `мягкий режим ${formatDuration(Math.abs(stats.trend))}/км`;

  return (
    <ScreenFrame>
      <motion.div variants={appear} initial="hidden" animate="visible" className="relative z-10 pt-8">
        <div className="pixel-window rounded-[28px] bg-white/90 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-cute text-[11px] uppercase text-berry">привет,</p>
              <h1 className="mt-2 font-pixel text-[18px] leading-[1.6]">{profile.name}</h1>
              <p className="font-round text-2xl leading-6 text-cocoa/75">до забега 20 июня осталось пройти милый путь ♡</p>
            </div>
            <KawaiiTiny />
          </div>
        </div>

        <motion.section
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
          className="mt-5 grid grid-cols-2 gap-3"
        >
          <ProgressCard label="готово" value={`${stats.completed}/${stats.total}`} footer={`${completionPercent}% плана`} tone="pink" />
          <ProgressCard label="до старта" value={`${daysLeft}`} footer="дней осталось" tone="lemon" />
          <motion.div variants={appear} className="pixel-window col-span-2 rounded-[24px] bg-sky/80 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-cute text-[11px] uppercase">средний темп</p>
                <p className="mt-2 font-pixel text-[16px] leading-6 text-berry">{formatPace(stats.averagePace)}</p>
                <p className="mt-1 font-round text-xl leading-5 text-cocoa/75">{trendText}</p>
              </div>
              <div className="w-[46%] min-w-[150px]">
                <MiniPaceChart values={stats.paceSeries} />
              </div>
            </div>
          </motion.div>
        </motion.section>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.25 }} className="mt-8 rounded-[32px] border-[4px] border-cocoa bg-blush/70 p-5 shadow-[0_8px_0_#6b3f55]">
          <KawaiiMascot mood="race" />
          <PixelButton onClick={onPlan} className="mt-7 w-full !py-5 text-[14px]" variant="pink">
            тренировки
          </PixelButton>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <PixelButton onClick={onAdmin} variant="cream" className="text-[10px]">админ</PixelButton>
            <PixelButton onClick={onLogout} variant="sky" className="text-[10px]">выйти</PixelButton>
          </div>
        </motion.div>
      </motion.div>
    </ScreenFrame>
  );
}

function KawaiiTiny() {
  return (
    <div className="relative h-[74px] w-[76px] shrink-0 rounded-[24px] border-4 border-cocoa bg-mint shadow-[0_6px_0_#6b3f55]">
      <div className="absolute left-4 top-7 h-2 w-2 rounded-full bg-cocoa" />
      <div className="absolute right-4 top-7 h-2 w-2 rounded-full bg-cocoa" />
      <div className="absolute bottom-5 left-1/2 h-2 w-5 -translate-x-1/2 rounded-full bg-cocoa" />
      <div className="absolute -right-2 -top-2 pixel-star h-5 w-5" />
    </div>
  );
}

function ProgressCard({ label, value, footer, tone }: { label: string; value: string; footer: string; tone: 'pink' | 'lemon' }) {
  return (
    <motion.div variants={appear} className={cn('pixel-window rounded-[24px] p-4', tone === 'pink' ? 'bg-blush' : 'bg-lemon')}>
      <p className="font-cute text-[10px] uppercase">{label}</p>
      <p className="mt-3 font-pixel text-[20px] leading-6 text-berry">{value}</p>
      <p className="mt-2 font-round text-xl leading-5 text-cocoa/75">{footer}</p>
    </motion.div>
  );
}

function PlanScreen({
  entries,
  onBack,
  onUpdateDay
}: {
  entries: Record<string, WorkoutEntry>;
  onBack: () => void;
  onUpdateDay: (dayId: string, patch: Partial<WorkoutEntry>) => void;
}) {
  return (
    <ScreenFrame footer={<BackButton onClick={onBack} label="назад" />}>
      <div className="relative z-10 pb-24 pt-8">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="pixel-window rounded-[28px] bg-white/90 p-4">
          <p className="font-cute text-[11px] uppercase text-berry">plan to race day</p>
          <h1 className="mt-2 font-pixel text-[17px] leading-[1.6]">План тренировок</h1>
          <p className="mt-2 font-round text-2xl leading-6 text-cocoa/80">Вся прогрессия ведёт к забегу 20 июня. Отмечай дни и записывай беговые данные.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} className="pixel-window mt-5 rounded-[26px] bg-lemon/90 p-4">
          <div className="flex items-center gap-2">
            <span className="pixel-star" />
            <p className="font-pixel text-[11px] uppercase leading-5">важные акценты</p>
          </div>
          <div className="mt-4 space-y-2">
            {importantAccents.map((accent) => (
              <div key={accent} className="rounded-2xl border-[3px] border-cocoa bg-cream px-3 py-2 font-round text-xl leading-5">
                ✿ {accent}
              </div>
            ))}
          </div>
        </motion.div>

        <div className="mt-7 space-y-8">
          {trainingPlan.map((week) => (
            <section key={week.id}>
              <div className="sticky top-3 z-20 pixel-window rounded-[22px] bg-candy px-4 py-3 text-white">
                <p className="font-pixel text-[12px] leading-5">{week.label}</p>
                <p className="mt-1 font-round text-xl leading-5">{week.description}</p>
              </div>
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-80px' }}
                variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
                className="mt-4 space-y-4"
              >
                {week.days.map((day) => (
                  <DayCard key={day.id} day={day} entry={entries[day.id]} onUpdate={(patch) => onUpdateDay(day.id, patch)} />
                ))}
              </motion.div>
            </section>
          ))}
        </div>
      </div>
    </ScreenFrame>
  );
}

function DayCard({ day, entry, onUpdate }: { day: TrainingDay; entry?: WorkoutEntry; onUpdate: (patch: Partial<WorkoutEntry>) => void }) {
  const completed = entry?.completed ?? day.defaultCompleted ?? false;
  const [distance, setDistance] = useState(entry?.distanceKm ? String(entry.distanceKm) : '');
  const [duration, setDuration] = useState(entry?.durationMinutes ? formatDuration(entry.durationMinutes) : '');
  const pace = getPace(entry);

  useEffect(() => {
    setDistance(entry?.distanceKm ? String(entry.distanceKm) : '');
    setDuration(entry?.durationMinutes ? formatDuration(entry.durationMinutes) : '');
  }, [entry?.distanceKm, entry?.durationMinutes]);

  const saveRun = () => {
    const distanceKm = Number(distance.replace(',', '.'));
    const durationMinutes = parseDurationToMinutes(duration);
    onUpdate({
      distanceKm: Number.isFinite(distanceKm) && distanceKm > 0 ? distanceKm : undefined,
      durationMinutes,
      completed: true
    });
  };

  return (
    <motion.article
      variants={appear}
      className={cn(
        'pixel-window overflow-hidden rounded-[26px] p-4',
        day.raceDay ? 'bg-candy text-white' : day.important ? 'bg-blush/95' : completed ? 'bg-mint/80' : 'bg-white/92'
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn('flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-[3px] border-cocoa font-pixel text-[10px] shadow-[0_4px_0_#6b3f55]', day.raceDay ? 'bg-lemon text-cocoa' : 'bg-sky text-cocoa')}>
          {day.weekday}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {day.important && <span className="rounded-full border-2 border-cocoa bg-lemon px-2 py-1 font-cute text-[9px] uppercase text-cocoa">важно</span>}
            {day.runDay && <span className="rounded-full border-2 border-cocoa bg-mint px-2 py-1 font-cute text-[9px] uppercase text-cocoa">бег</span>}
          </div>
          <h3 className="mt-2 font-pixel text-[12px] leading-6">{day.title}</h3>
          {day.subtitle && <p className={cn('mt-1 font-round text-xl leading-5', day.raceDay ? 'text-white/85' : 'text-cocoa/75')}>{day.subtitle}</p>}
        </div>
      </div>

      <ul className="mt-4 space-y-2">
        {day.tasks.map((task) => (
          <li key={task} className={cn('rounded-2xl border-[3px] px-3 py-2 font-round text-xl leading-5', day.raceDay ? 'border-white/80 bg-white/15' : 'border-cocoa bg-cream/75')}>
            <span className="mr-2">♡</span>{task}
          </li>
        ))}
      </ul>

      {day.runDay && (
        <div className={cn('mt-4 rounded-[22px] border-[3px] p-3', day.raceDay ? 'border-white/80 bg-white/15' : 'border-cocoa bg-sky/70')}>
          <p className="font-cute text-[10px] uppercase">данные после тренировки</p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <label className="font-round text-xl leading-5">
              км
              <input
                value={distance}
                onChange={(event) => setDistance(event.target.value.replace(/[^0-9,.]/g, ''))}
                inputMode="decimal"
                className="pixel-input mt-1 w-full rounded-xl px-3 py-2 text-xl"
                placeholder="5.5"
              />
            </label>
            <label className="font-round text-xl leading-5">
              время
              <input
                value={duration}
                onChange={(event) => setDuration(event.target.value.replace(/[^0-9:,.]/g, ''))}
                inputMode="numeric"
                className="pixel-input mt-1 w-full rounded-xl px-3 py-2 text-xl"
                placeholder="35:20"
              />
            </label>
          </div>
          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="rounded-2xl border-[3px] border-cocoa bg-cream px-3 py-2 font-pixel text-[10px] leading-5 text-berry">
              темп: {formatPace(pace)}
            </div>
            <PixelButton onClick={saveRun} variant="mint" className="!px-3 !py-2 text-[10px]">save</PixelButton>
          </div>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between gap-3">
        <span className={cn('font-cute text-[11px] uppercase', day.raceDay ? 'text-white' : 'text-cocoa')}>{completed ? 'выполнено ✦' : 'не выполнено'}</span>
        <PixelButton onClick={() => onUpdate({ completed: !completed })} variant={completed ? 'cream' : 'pink'} className="!px-3 !py-2 text-[10px]">
          {completed ? 'снять' : 'готово'}
        </PixelButton>
      </div>
    </motion.article>
  );
}

function BackButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -2 }}
      whileTap={springTap}
      className="fixed bottom-4 left-1/2 z-50 flex w-[calc(100%-32px)] max-w-[488px] -translate-x-1/2 items-center justify-center gap-2 rounded-[24px] border-4 border-cocoa bg-white/95 px-4 py-3 font-pixel text-[11px] uppercase text-cocoa shadow-[0_7px_0_#6b3f55] backdrop-blur"
    >
      ← {label}
    </motion.button>
  );
}

export default function App() {
  const [profiles, setProfilesState] = useState<UserProfile[]>(() => storage.getProfiles());
  const [progress, setProgressState] = useState<ProgressByProfile>(() => storage.getProgress());
  const [activeProfileId, setActiveProfileId] = useState<string | null>(() => storage.getSession());
  const [view, setView] = useState<ViewName>('home');

  const activeProfile = profiles.find((profile) => profile.id === activeProfileId) ?? null;
  const activeEntries = activeProfile ? progress[activeProfile.id] ?? {} : {};

  useEffect(() => {
    if (activeProfileId && !profiles.some((profile) => profile.id === activeProfileId)) {
      storage.clearSession();
      setActiveProfileId(null);
    }
  }, [activeProfileId, profiles]);

  const syncProfiles = (next: UserProfile[]) => {
    setProfilesState(next);
    storage.setProfiles(next);
  };

  const syncProgress = (next: ProgressByProfile) => {
    setProgressState(next);
    storage.setProgress(next);
  };

  const login = (profile: UserProfile) => {
    storage.setSession(profile.id);
    setActiveProfileId(profile.id);
    setView('home');
  };

  const createOnly = (name: string, pin: string) => {
    const profile = createProfile(name, pin);
    syncProfiles([...profiles, profile]);
  };

  const deleteProfile = (id: string) => {
    syncProfiles(profiles.filter((profile) => profile.id !== id));
    const nextProgress = { ...progress };
    delete nextProgress[id];
    syncProgress(nextProgress);
    if (activeProfileId === id) {
      storage.clearSession();
      setActiveProfileId(null);
      setView('home');
    }
  };

  const updateDay = (dayId: string, patch: Partial<WorkoutEntry>) => {
    if (!activeProfile) return;
    const current = progress[activeProfile.id]?.[dayId];
    const nextEntry: WorkoutEntry = {
      ...(current ?? { completed: false, updatedAt: new Date().toISOString() }),
      ...patch,
      completed: patch.completed ?? current?.completed ?? false,
      updatedAt: new Date().toISOString()
    };
    syncProgress({
      ...progress,
      [activeProfile.id]: {
        ...(progress[activeProfile.id] ?? {}),
        [dayId]: nextEntry
      }
    });
  };

  const logout = () => {
    storage.clearSession();
    setActiveProfileId(null);
    setView('home');
  };

  if (!activeProfile) {
    if (view === 'profiles') {
      return <ProfileManager profiles={profiles} onCreate={createOnly} onDelete={deleteProfile} onBack={() => setView('home')} />;
    }
    if (view === 'admin') {
      return <AdminLoginScreen onSuccess={() => setView('profiles')} onBack={() => setView('home')} />;
    }
    return <LoginScreen profiles={profiles} onLogin={login} onOpenAdmin={() => setView('admin')} />;
  }

  return (
    <AnimatePresence mode="wait">
      {view === 'plan' ? (
        <PlanScreen key="plan" entries={activeEntries} onBack={() => setView('home')} onUpdateDay={updateDay} />
      ) : view === 'profiles' ? (
        <ProfileManager key="profiles" profiles={profiles} onCreate={createOnly} onDelete={deleteProfile} onBack={() => setView('home')} />
      ) : view === 'admin' ? (
        <AdminLoginScreen key="admin" onSuccess={() => setView('profiles')} onBack={() => setView('home')} />
      ) : (
        <HomeScreen key="home" profile={activeProfile} entries={activeEntries} onPlan={() => setView('plan')} onAdmin={() => setView('admin')} onLogout={logout} />
      )}
    </AnimatePresence>
  );
}
