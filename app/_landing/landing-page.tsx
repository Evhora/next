"use client";

import {
  AnimatePresence,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  ArrowRight,
  Check,
  Compass,
  ImageIcon,
  LineChart,
  ListChecks,
  Sparkles,
  Star,
  Target,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FadeUp, StaggerGroup, StaggerItem, motion } from "./motion-primitives";

const EASE = [0.22, 1, 0.36, 1] as const;

export function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-white text-zinc-900 antialiased">
      <BackgroundOrbs />
      <Nav />
      <Hero />
      <ValueStrip />
      <Features />
      <HowItWorks />
      <DreamBoardShowcase />
      <Pricing />
      <FAQ />
      <FinalCTA />
      <Footer />
    </div>
  );
}

function BackgroundOrbs() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1200], [0, 180]);
  const y2 = useTransform(scrollY, [0, 1200], [0, -120]);
  const y3 = useTransform(scrollY, [0, 1200], [0, 220]);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-screen overflow-hidden"
    >
      <motion.div
        style={{ y: y1 }}
        className="absolute -top-40 left-1/2 h-[640px] w-[1100px] -translate-x-1/2 rounded-full bg-gradient-to-br from-violet-300/50 via-fuchsia-200/40 to-transparent blur-3xl"
      />
      <motion.div
        style={{ y: y2 }}
        className="absolute -top-24 right-[-10%] h-[420px] w-[420px] rounded-full bg-gradient-to-br from-amber-200/40 to-transparent blur-3xl"
      />
      <motion.div
        style={{ y: y3 }}
        className="absolute top-40 left-[-10%] h-[420px] w-[420px] rounded-full bg-gradient-to-br from-violet-200/40 to-transparent blur-3xl"
      />
    </div>
  );
}

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: EASE }}
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-zinc-200/60 bg-white/80 shadow-sm shadow-zinc-900/[0.02] backdrop-blur-xl"
          : "border-b border-transparent bg-white/40 backdrop-blur"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <Logo />
          <span className="font-display text-xl font-light tracking-tight">
            Evhora
          </span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-zinc-600 md:flex">
          {[
            ["Funcionalidades", "#features"],
            ["Como funciona", "#how"],
            ["Preços", "#pricing"],
            ["Dúvidas", "#faq"],
          ].map(([label, href]) => (
            <a
              key={href}
              href={href}
              className="relative transition-colors hover:text-zinc-900"
            >
              {label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/auth/login"
            className="hidden h-9 items-center px-4 text-sm font-medium text-zinc-700 transition-colors hover:text-zinc-900 sm:inline-flex"
          >
            Entrar
          </Link>
          <Link
            href="/auth/sign-up"
            className="group relative inline-flex h-9 items-center gap-1.5 overflow-hidden rounded-full bg-zinc-900 px-4 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md"
          >
            <span className="relative z-10">Começar</span>
            <ArrowRight className="relative z-10 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-violet-600 to-fuchsia-600 transition-transform duration-300 group-hover:translate-x-0" />
          </Link>
        </div>
      </div>
    </motion.header>
  );
}

function Logo() {
  return (
    <motion.span
      aria-hidden
      whileHover={{ rotate: 12, scale: 1.05 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-violet-500 via-violet-600 to-fuchsia-500 shadow-sm ring-1 ring-violet-500/20"
    >
      <Sparkles className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
    </motion.span>
  );
}

function Hero() {
  return (
    <section className="relative mx-auto max-w-7xl px-6 pt-20 pb-24 sm:pt-28 sm:pb-32">
      <StaggerGroup className="mx-auto max-w-3xl text-center" amount={0.1}>
        <StaggerItem className="mb-8 inline-flex items-center gap-2 rounded-full border border-violet-200/60 bg-violet-50/80 px-3.5 py-1.5 text-xs font-medium text-violet-700 backdrop-blur">
          <motion.span
            animate={{ rotate: [0, 14, -10, 0] }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatDelay: 4,
              ease: "easeInOut",
            }}
          >
            <Sparkles className="h-3.5 w-3.5" />
          </motion.span>
          Sonhar grande agora tem um método
        </StaggerItem>
        <StaggerItem>
          <h1 className="font-display text-5xl leading-[1.05] tracking-tight text-zinc-900 sm:text-6xl md:text-7xl">
            Transforme sonhos
            <br />
            em{" "}
            <em className="relative inline-block italic text-violet-600">
              conquistas reais.
              <motion.span
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1, delay: 0.9, ease: EASE }}
                style={{ transformOrigin: "left" }}
                className="absolute -bottom-1 left-0 right-0 h-[3px] rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
              />
            </em>
          </h1>
        </StaggerItem>
        <StaggerItem>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-zinc-600">
            Descubra o que você quer da vida, quebre em ações concretas e
            acompanhe seu progresso. Com um mural visual gerado por IA para
            manter você inspirado todos os dias.
          </p>
        </StaggerItem>
        <StaggerItem className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <motion.div
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            <Link
              href="/auth/sign-up"
              className="group inline-flex h-12 items-center gap-2 rounded-full bg-zinc-900 px-7 text-sm font-medium text-white shadow-lg shadow-zinc-900/10 transition-shadow hover:bg-zinc-800 hover:shadow-xl"
            >
              Começar gratuitamente
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
          <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
            <Link
              href="#features"
              className="inline-flex h-12 items-center rounded-full border border-zinc-200 bg-white/80 px-7 text-sm font-medium text-zinc-700 backdrop-blur transition-colors hover:border-zinc-300 hover:bg-white"
            >
              Ver como funciona
            </Link>
          </motion.div>
        </StaggerItem>
        <StaggerItem className="mt-5 text-xs text-zinc-500">
          Sem cartão de crédito · Cancele quando quiser
        </StaggerItem>
      </StaggerGroup>

      <HeroPreview />
    </section>
  );
}

function HeroPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 60, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 1, delay: 0.5, ease: EASE }}
      className="relative mx-auto mt-20 max-w-5xl"
    >
      <div className="absolute inset-x-10 -top-6 h-12 rounded-3xl bg-gradient-to-b from-violet-200/50 to-transparent blur-2xl" />
      <div className="relative rounded-2xl border border-zinc-200/80 bg-white/80 p-2 shadow-2xl shadow-violet-500/10 backdrop-blur">
        <div className="rounded-xl border border-zinc-100 bg-gradient-to-br from-zinc-50 to-white p-6 sm:p-10">
          <div className="grid gap-6 md:grid-cols-3">
            <PreviewCard
              icon={<Target className="h-4 w-4" />}
              label="Sonho"
              title="Viajar pela Patagônia"
              tint="violet"
              pct={62}
              floatDelay={0}
            />
            <PreviewCard
              icon={<ListChecks className="h-4 w-4" />}
              label="Próxima ação"
              title="Reservar voos para Bariloche"
              tint="amber"
              pct={0}
              meta="Hoje"
              floatDelay={0.6}
            />
            <PreviewCard
              icon={<ImageIcon className="h-4 w-4" />}
              label="Mural visual"
              title="Gerado por IA"
              tint="fuchsia"
              pct={0}
              meta="3 imagens"
              floatDelay={1.2}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function PreviewCard({
  icon,
  label,
  title,
  tint,
  pct,
  meta,
  floatDelay = 0,
}: {
  icon: React.ReactNode;
  label: string;
  title: string;
  tint: "violet" | "amber" | "fuchsia";
  pct: number | null;
  meta?: string;
  floatDelay?: number;
}) {
  const tints: Record<string, string> = {
    violet: "bg-violet-50 text-violet-700 ring-violet-200/60",
    amber: "bg-amber-50 text-amber-700 ring-amber-200/60",
    fuchsia: "bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-200/60",
  };
  const bars: Record<string, string> = {
    violet: "bg-violet-500",
    amber: "bg-amber-500",
    fuchsia: "bg-fuchsia-500",
  };
  return (
    <div
      style={{
        animation: "evhoraFloat 6s ease-in-out infinite",
        animationDelay: `${floatDelay}s`,
        willChange: "transform",
      }}
      className="group rounded-xl border border-zinc-200/70 bg-white p-5 shadow-sm transition-shadow duration-300 hover:shadow-lg"
    >
      <div className="flex items-center justify-between">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${tints[tint]}`}
        >
          {icon}
          {label}
        </span>
        {meta && <span className="text-xs text-zinc-500">{meta}</span>}
      </div>
      <p className="mt-4 text-base font-medium text-zinc-900">{title}</p>
      {pct !== null && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span>Progresso</span>
            <span className="font-medium text-zinc-700">{pct}%</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-100">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${pct}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1.4, delay: 0.6, ease: EASE }}
              className={`h-full rounded-full ${bars[tint]}`}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function ValueStrip() {
  const items = [
    "Clareza sobre o que importa",
    "Ações no calendário",
    "Visualização inspiradora",
    "Progresso mensurável",
  ];
  return (
    <section className="border-y border-zinc-100 bg-zinc-50/50 py-6">
      <StaggerGroup
        className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-6 text-sm text-zinc-500"
        amount={0.4}
      >
        {items.map((it) => (
          <StaggerItem key={it} className="inline-flex items-center gap-2">
            <Check className="h-4 w-4 text-violet-600" />
            {it}
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  );
}

function Features() {
  const features = [
    {
      icon: Compass,
      title: "Descubra seus sonhos",
      desc: "Um espaço guiado para colocar no papel o que você realmente quer — em qualquer área da vida.",
    },
    {
      icon: ListChecks,
      title: "Quebre em ações",
      desc: "Cada sonho vira passos concretos com prazos e recorrência. Pequenos avanços que somam grandes mudanças.",
    },
    {
      icon: LineChart,
      title: "Acompanhe o progresso",
      desc: "Veja sua evolução por área de vida, com gráficos e métricas que mostram o quanto você já caminhou.",
    },
    {
      icon: ImageIcon,
      title: "Mural visual com IA",
      desc: "Gere imagens dos seus sonhos com inteligência artificial e mantenha viva a inspiração todos os dias.",
    },
  ];
  return (
    <section id="features" className="mx-auto max-w-7xl px-6 py-24 sm:py-32">
      <FadeUp className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-violet-600">
          Funcionalidades
        </p>
        <h2 className="mt-3 font-display text-4xl tracking-tight text-zinc-900 sm:text-5xl">
          Tudo o que você precisa para
          <br />
          <em className="italic text-violet-600">tirar do papel.</em>
        </h2>
      </FadeUp>
      <StaggerGroup
        className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
        amount={0.15}
      >
        {features.map((f, i) => (
          <StaggerItem key={i}>
            <motion.div
              whileHover={{ y: -6 }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
              className="group relative h-full overflow-hidden rounded-2xl border border-zinc-200/70 bg-white p-6 transition-shadow hover:border-violet-200 hover:shadow-xl hover:shadow-violet-500/10"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-gradient-to-br from-violet-500/0 via-violet-500/0 to-fuchsia-500/0 opacity-0 transition-opacity duration-500 group-hover:from-violet-500/[0.04] group-hover:to-fuchsia-500/[0.06] group-hover:opacity-100"
              />
              <motion.div
                whileHover={{ rotate: 8, scale: 1.08 }}
                transition={{ type: "spring", stiffness: 300, damping: 18 }}
                className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-sm shadow-violet-500/30"
              >
                <f.icon className="h-5 w-5" strokeWidth={2} />
              </motion.div>
              <h3 className="mt-5 text-base font-semibold text-zinc-900">
                {f.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                {f.desc}
              </p>
            </motion.div>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      n: "01",
      title: "Capture seus sonhos",
      desc: "Liste o que você quer conquistar. Carreira, saúde, viagens, relacionamentos — tudo em um só lugar.",
    },
    {
      n: "02",
      title: "Quebre em ações",
      desc: "Para cada sonho, defina passos e prazos. Diários, semanais ou pontuais — do seu jeito.",
    },
    {
      n: "03",
      title: "Visualize e realize",
      desc: "Acompanhe o progresso e gere um mural visual com IA para manter o foco no que importa.",
    },
  ];
  return (
    <section id="how" className="bg-zinc-50/60 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <FadeUp className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-violet-600">
            Como funciona
          </p>
          <h2 className="mt-3 font-display text-4xl tracking-tight text-zinc-900 sm:text-5xl">
            Simples por design,
            <br />
            <em className="italic text-violet-600">profundo na prática.</em>
          </h2>
        </FadeUp>
        <StaggerGroup className="mt-16 grid gap-8 md:grid-cols-3" amount={0.2}>
          {steps.map((s) => (
            <StaggerItem key={s.n} className="relative">
              <motion.div
                whileHover={{ scale: 1.04, color: "rgb(139 92 246)" }}
                className="font-display text-6xl font-light text-violet-200"
              >
                {s.n}
              </motion.div>
              <h3 className="mt-2 text-lg font-semibold text-zinc-900">
                {s.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                {s.desc}
              </p>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}

function DreamBoardShowcase() {
  const tiles = [
    { src: "/man_in_patagonia.jpg", label: "Patagônia" },
    { src: "/woman_in_triatlon.jpg", label: "Maratona" },
    { src: "/new_house.jpg", label: "Casa nova" },
    { src: "/new_business.jpg", label: "Negócio" },
    { src: "/happy_family.jpg", label: "Família" },
    { src: "/woman_studying.jpg", label: "Estudos" },
  ];
  return (
    <section className="mx-auto max-w-7xl px-6 py-24 sm:py-32">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <FadeUp>
          <p className="text-sm font-medium uppercase tracking-widest text-violet-600">
            Mural dos Sonhos
          </p>
          <h2 className="mt-3 font-display text-4xl tracking-tight text-zinc-900 sm:text-5xl">
            Veja seus sonhos
            <br />
            <em className="italic text-violet-600">antes de vivê-los.</em>
          </h2>
          <p className="mt-5 max-w-md text-base leading-relaxed text-zinc-600">
            Nossa IA gera imagens personalizadas de cada sonho, criando um mural
            visual que vive com você. Estudos mostram que visualizar objetivos
            aumenta significativamente as chances de conquistá-los.
          </p>
          <StaggerGroup
            className="mt-6 space-y-3 text-sm text-zinc-700"
            as="ul"
          >
            {[
              "Imagens únicas geradas por IA para cada sonho",
              "Mural sempre acessível, do celular ao desktop",
              "Atualize as imagens à medida que seus sonhos evoluem",
            ].map((b) => (
              <StaggerItem key={b}>
                <li className="flex items-start gap-2.5">
                  <Check className="mt-0.5 h-4 w-4 flex-none text-violet-600" />
                  {b}
                </li>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </FadeUp>
        <div className="relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.9, ease: EASE }}
            className="absolute -inset-6 rounded-3xl bg-gradient-to-br from-violet-200/40 via-fuchsia-200/30 to-amber-100/30 blur-2xl"
          />
          <StaggerGroup
            className="relative grid grid-cols-3 gap-3 rounded-2xl border border-zinc-200/70 bg-white/70 p-3 shadow-xl backdrop-blur"
            amount={0.2}
          >
            {tiles.map((t, i) => (
              <StaggerItem key={t.src}>
                <motion.div
                  whileHover={{ scale: 1.05, rotate: i % 2 ? 1 : -1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 18 }}
                  className="group relative aspect-square overflow-hidden rounded-xl bg-zinc-100 shadow-sm ring-1 ring-zinc-900/5"
                >
                  <Image
                    src={t.src}
                    alt={t.label}
                    fill
                    sizes="(min-width: 1024px) 180px, (min-width: 640px) 25vw, 33vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  />
                  <div
                    aria-hidden
                    className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent"
                  />
                  <motion.div
                    aria-hidden
                    initial={{ x: "-120%" }}
                    whileHover={{ x: "120%" }}
                    transition={{ duration: 0.9, ease: EASE }}
                    className="absolute inset-y-0 -inset-x-4 bg-gradient-to-r from-transparent via-white/25 to-transparent"
                  />
                  <span className="absolute bottom-2.5 left-3 text-xs font-medium tracking-wide text-white drop-shadow-md">
                    {t.label}
                  </span>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section id="pricing" className="bg-zinc-50/60 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <FadeUp className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-violet-600">
            Preços
          </p>
          <h2 className="mt-3 font-display text-4xl tracking-tight text-zinc-900 sm:text-5xl">
            Um investimento
            <br />
            <em className="italic text-violet-600">no seu futuro.</em>
          </h2>
          <p className="mt-4 text-base text-zinc-600">
            Comece hoje. Cancele quando quiser.
          </p>
        </FadeUp>
        <StaggerGroup
          className="mx-auto mt-14 grid max-w-3xl gap-6 sm:grid-cols-2"
          amount={0.2}
        >
          <StaggerItem>
            <PricingCardSimple
              name="Mensal"
              price="R$ 29,90"
              period="/mês"
              note="Cobrado mensalmente"
              highlighted={false}
            />
          </StaggerItem>
          <StaggerItem>
            <PricingCardSimple
              name="Anual"
              price="R$ 299,90"
              period="/ano"
              note="Equivale a R$ 24,99/mês · economize 16%"
              highlighted
              badge="Recomendado"
            />
          </StaggerItem>
        </StaggerGroup>
      </div>
    </section>
  );
}

function PricingCardSimple({
  name,
  price,
  period,
  note,
  highlighted,
  badge,
}: {
  name: string;
  price: string;
  period: string;
  note: string;
  highlighted: boolean;
  badge?: string;
}) {
  const features = [
    "Sonhos e ações ilimitados",
    "Mural visual com imagens IA",
    "Progresso por área de vida",
    "Acompanhamento diário",
    "Suporte prioritário",
  ];
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className={`relative h-full rounded-2xl p-7 ${
        highlighted
          ? "border-2 border-violet-500 bg-gradient-to-b from-violet-50/60 to-white shadow-xl shadow-violet-500/10"
          : "border border-zinc-200 bg-white shadow-sm hover:shadow-md"
      }`}
    >
      {badge && (
        <motion.span
          initial={{ scale: 0.6, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{
            delay: 0.3,
            type: "spring",
            stiffness: 300,
            damping: 18,
          }}
          className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-violet-600 px-3 py-1 text-xs font-medium text-white shadow-sm"
        >
          {badge}
        </motion.span>
      )}
      <div className="flex items-baseline justify-between">
        <h3 className="text-lg font-semibold text-zinc-900">{name}</h3>
      </div>
      <div className="mt-4 flex items-baseline gap-1">
        <span className="font-display text-5xl tracking-tight text-zinc-900">
          {price}
        </span>
        <span className="text-sm text-zinc-500">{period}</span>
      </div>
      <p className="mt-1.5 text-xs text-zinc-500">{note}</p>
      <Link
        href="/auth/sign-up"
        className={`group mt-6 inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-full text-sm font-medium transition-all hover:gap-2.5 ${
          highlighted
            ? "bg-violet-600 text-white shadow-md shadow-violet-500/30 hover:bg-violet-700 hover:shadow-lg hover:shadow-violet-500/40"
            : "bg-zinc-900 text-white hover:bg-zinc-800"
        }`}
      >
        Começar agora
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </Link>
      <ul className="mt-6 space-y-2.5 text-sm text-zinc-700">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2.5">
            <Check className="mt-0.5 h-4 w-4 flex-none text-violet-600" />
            {f}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

function FAQ() {
  const items = [
    {
      q: "Como funciona o mural visual com IA?",
      a: "Você descreve seu sonho e nossa IA gera imagens personalizadas que representam visualmente cada objetivo. Você pode regenerar quantas vezes quiser até encontrar a imagem perfeita.",
    },
    {
      q: "Posso cancelar a qualquer momento?",
      a: "Sim. Cancele com um clique a qualquer momento, sem perguntas, sem burocracia. Seu acesso continua até o fim do período já pago.",
    },
    {
      q: "Para quem é o Evhora?",
      a: "Para qualquer pessoa que queira ter mais clareza sobre o que deseja da vida e um método simples para chegar lá — em carreira, saúde, finanças, relacionamentos ou qualquer outra área.",
    },
    {
      q: "Meus dados ficam seguros?",
      a: "Sim. Usamos infraestrutura segura com criptografia e seus sonhos são privados — apenas você tem acesso a eles.",
    },
    {
      q: "Existe versão grátis?",
      a: "Você pode criar sua conta e explorar a plataforma. Para uso completo, escolha o plano mensal ou anual.",
    },
  ];
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="mx-auto max-w-3xl px-6 py-24 sm:py-32">
      <FadeUp className="text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-violet-600">
          Dúvidas
        </p>
        <h2 className="mt-3 font-display text-4xl tracking-tight text-zinc-900 sm:text-5xl">
          Perguntas frequentes
        </h2>
      </FadeUp>
      <div className="mt-12 divide-y divide-zinc-200 border-y border-zinc-200">
        {items.map((it, i) => {
          const isOpen = open === i;
          return (
            <div key={i} className="py-2">
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full cursor-pointer items-center justify-between gap-4 py-4 text-left text-base font-medium text-zinc-900"
              >
                <span>{it.q}</span>
                <motion.span
                  animate={{ rotate: isOpen ? 45 : 0 }}
                  transition={{ duration: 0.25, ease: EASE }}
                  className="grid h-7 w-7 flex-none place-items-center rounded-full border border-zinc-200 text-zinc-500"
                >
                  +
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: EASE }}
                    className="overflow-hidden"
                  >
                    <p className="pb-4 pr-10 text-sm leading-relaxed text-zinc-600">
                      {it.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="px-6 pb-24">
      <FadeUp y={40}>
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-violet-700 to-fuchsia-700 px-8 py-16 text-center shadow-2xl shadow-violet-600/30 sm:px-16 sm:py-20">
          <motion.div
            aria-hidden
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            style={{ backgroundSize: "200% 200%" }}
            className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.25),transparent_60%),radial-gradient(ellipse_at_bottom_right,rgba(255,200,150,0.2),transparent_50%)]"
          />
          <Sheen />
          <div className="relative">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.15, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="inline-block"
            >
              <Star className="h-6 w-6 text-amber-300" fill="currentColor" />
            </motion.div>
            <h2 className="mt-4 font-display text-4xl tracking-tight text-white sm:text-5xl">
              Seus sonhos merecem
              <br />
              <em className="italic">mais que um post-it.</em>
            </h2>
            <p className="mx-auto mt-5 max-w-lg text-base text-violet-100">
              Comece agora e dê o primeiro passo concreto rumo ao que você
              realmente quer da vida.
            </p>
            <motion.div
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="mt-8 inline-block"
            >
              <Link
                href="/auth/sign-up"
                className="inline-flex h-12 items-center gap-2 rounded-full bg-white px-7 text-sm font-medium text-violet-700 shadow-lg transition-shadow hover:shadow-xl"
              >
                Criar minha conta
                <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
            <p className="mt-4 text-xs text-violet-200">
              Sem cartão de crédito · Cancele quando quiser
            </p>
          </div>
        </div>
      </FadeUp>
    </section>
  );
}

function Sheen() {
  const { scrollYProgress } = useScroll();
  const x = useSpring(
    useTransform(scrollYProgress, [0.85, 1], ["-30%", "130%"]),
    {
      stiffness: 60,
      damping: 20,
    },
  );
  return (
    <motion.div
      aria-hidden
      style={{ x }}
      className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/15 to-transparent blur-2xl"
    />
  );
}

function Footer() {
  return (
    <footer className="border-t border-zinc-100 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-10 sm:flex-row">
        <div className="flex items-center gap-2">
          <Logo />
          <span className="font-display text-lg font-light tracking-tight text-zinc-900">
            Evhora
          </span>
          <span className="ml-2 text-xs text-zinc-500">
            © {new Date().getFullYear()}
          </span>
        </div>
        <div className="flex items-center gap-6 text-sm text-zinc-500">
          <Link href="/auth/login" className="hover:text-zinc-900">
            Entrar
          </Link>
          <Link href="/auth/sign-up" className="hover:text-zinc-900">
            Cadastrar
          </Link>
          <Link href="/pricing" className="hover:text-zinc-900">
            Preços
          </Link>
        </div>
      </div>
    </footer>
  );
}
