import CollapsiblePanel from '../../components/CollapsiblePanel'
import { missionSteps, MissionCard } from './missionPageShared'

export default function MissionCatalogPage({ missions, onOpenMission }) {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <section className="reveal relative overflow-hidden rounded-[34px] border border-black/10 bg-[var(--panel)] px-6 py-8 shadow-[0_30px_80px_rgba(47,37,22,0.14)] sm:px-10 sm:py-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(36,107,94,0.18),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(194,87,55,0.2),transparent_35%)]" />
        <div className="relative grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-stone-600">Mode mission</p>
            <h1 className="mt-3 text-4xl text-stone-950 sm:text-5xl">Architecte logiciel en conditions reelles</h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-stone-700 sm:text-lg">
              Choisis un scenario, puis ouvre sa page dediee pour composer la solution, configurer les patterns et verifier le systeme dans une scene SVG specifique a la mission.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {missionSteps.map((step, index) => (
                <div key={step} className="rounded-[20px] border border-black/10 bg-white/80 px-4 py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-500">Etape {index + 1}</p>
                  <p className="mt-1 text-sm font-semibold text-stone-900">{step}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[26px] border border-black/10 bg-white/80 px-5 py-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Principe</p>
            <ul className="mt-3 grid gap-3 text-sm leading-7 text-stone-700">
              <li className="rounded-2xl border border-black/10 bg-[var(--panel)] px-4 py-3">
                1. Choisir un scenario metier.
              </li>
              <li className="rounded-2xl border border-black/10 bg-[var(--panel)] px-4 py-3">
                2. Ouvrir sa page dediee pour composer la solution.
              </li>
              <li className="rounded-2xl border border-black/10 bg-[var(--panel)] px-4 py-3">
                3. Configurer et verifier la mission dans une scene SVG specifique.
              </li>
            </ul>
          </div>
        </div>
      </section>

      <CollapsiblePanel
        eyebrow="Missions"
        title="Choisir un scenario"
        description="Le catalogue sert uniquement a choisir une mission. Le clic ouvre ensuite une page detail distincte pour travailler sur ce scenario."
        bodyClassName="grid gap-3"
      >
        <div className="grid gap-3 lg:grid-cols-2">
          {missions.map((mission) => (
            <MissionCard
              key={mission.id}
              mission={mission}
              onOpen={() => onOpenMission(mission.id)}
            />
          ))}
        </div>
      </CollapsiblePanel>
    </div>
  )
}
