const PLACEHOLDER = 'À compléter avant mise en ligne'

const editorDetails = [
  { label: 'Nom du projet', value: 'Design Pattern Playground' },
  { label: 'Statut', value: 'Site personnel edite a titre non professionnel' },
  {
    label: 'Publication de l identite',
    value: "Les informations personnelles de l'éditeur ne sont pas publiées sur cette page.",
  },
]

const hostingDetails = [
  { label: 'Hebergeur', value: 'OVH SAS' },
  { label: 'Adresse de l hebergeur', value: '2 rue Kellermann, 59100 Roubaix, France' },
]

const privacyHighlights = [
  {
    title: 'Quelles donnees sont utilisees',
    items: [
      'Les informations de compte : votre pseudo et la date de creation du compte.',
      'Votre mot de passe, conserve de maniere securisee et jamais affiche publiquement.',
      'Les informations necessaires pour vous garder connecte(e) au site.',
      'Votre progression dans les quiz : tentatives, scores et badges obtenus.',
      "Une information de session conservée dans votre navigateur jusqu'à la déconnexion.",
    ],
  },
  {
    title: 'Pourquoi ces donnees sont utilisees',
    items: [
      'Créer et gérer votre compte utilisateur.',
      'Vous permettre de vous connecter en toute securite.',
      'Enregistrer votre progression et vos résultats dans les quiz.',
      'Vous éviter de devoir vous reconnecter à chaque visite.',
    ],
  },
  {
    title: 'Destinataires',
    items: [
      'Les donnees sont uniquement accessibles a la personne en charge du site et, si necessaire, a l hebergeur ou aux services techniques indispensables au fonctionnement.',
      'Aucune utilisation publicitaire ou marketing de ces donnees n est faite.',
    ],
  },
]

const retentionRules = [
  {
    title: 'Cookies de session',
    description: 'Le cookie d authentification expire apres 15 minutes. Le refresh token expire apres 7 jours. Ces cookies sont utilises uniquement pour maintenir la session utilisateur.',
  },
  {
    title: 'Resume de session local',
    description: "La clé locale dpp_auth_user reste dans le navigateur jusqu'à la déconnexion ou à l'effacement manuel du stockage local.",
  },
  {
    title: 'Compte utilisateur et progression',
    description: 'Les donnees de compte et de progression sont conservees en base de donnees tant qu aucune suppression manuelle n est effectuee. En l etat, aucune purge automatique de ces donnees n est implementee dans l application.',
  },
]

const rights = [
  'droit d acces',
  'droit de rectification',
  'droit a l effacement',
  'droit a la limitation du traitement',
  'droit d opposition selon la base legale retenue',
  'droit d introduire une reclamation aupres de la CNIL',
]

function DetailCard({ eyebrow, title, items }) {
  return (
    <section className="rounded-[30px] border border-black/10 bg-white/82 p-6 shadow-[0_18px_45px_rgba(47,37,22,0.08)] backdrop-blur-sm sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">{eyebrow}</p>
      <h2 className="mt-3 text-2xl text-stone-950 sm:text-3xl">{title}</h2>

      <dl className="mt-6 grid gap-4">
        {items.map((item) => (
          <div
            key={item.label}
            className="rounded-[24px] border border-black/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(247,240,226,0.9))] px-4 py-4"
          >
            <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">{item.label}</dt>
            <dd className={`mt-2 text-sm leading-7 ${item.placeholder ? 'text-amber-700' : 'text-stone-800'}`}>
              {item.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

export default function LegalNoticePage({ onNavigateHome }) {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <section className="reveal relative overflow-hidden rounded-[34px] border border-black/10 bg-[var(--panel)] px-6 py-8 shadow-[0_30px_80px_rgba(47,37,22,0.14)] sm:px-10 sm:py-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(36,107,94,0.18),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(194,87,55,0.2),transparent_35%)]" />
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
            Mentions legales et confidentialite
          </p>
          <h1 className="mt-4 text-4xl text-stone-950 sm:text-5xl">
            Informations legales et traitement des donnees
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-stone-700 sm:text-base">
            Cette page presente les mentions legales applicables a ce site personnel non professionnel ainsi que
            les informations essentielles relatives aux donnees personnelles traitees dans l application.
          </p>

          <button
            className="mt-6 rounded-full border border-black/10 bg-white/84 px-5 py-3 text-sm font-semibold text-stone-800 transition hover:border-black/20"
            type="button"
            onClick={onNavigateHome}
          >
            Retour à l'accueil
          </button>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <DetailCard
          eyebrow="Éditeur"
          title="Statut du site"
          items={editorDetails}
        />

        <DetailCard
          eyebrow="Hebergement"
          title="Informations hebergeur"
          items={hostingDetails}
        />
      </div>

      <section className="rounded-[30px] border border-black/10 bg-white/82 p-6 shadow-[0_18px_45px_rgba(47,37,22,0.08)] backdrop-blur-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Propriete intellectuelle</p>
        <h2 className="mt-3 text-2xl text-stone-950 sm:text-3xl">Contenus et reutilisation</h2>
        <p className="mt-4 text-sm leading-7 text-stone-700">
          Les contenus, maquettes, textes, illustrations, schémas et éléments de marque présentés sur ce site restent
          protégés par le droit de la propriété intellectuelle. Toute reproduction, adaptation ou republication, totale
          ou partielle, doit être autorisée préalablement par l'éditeur, sauf usage privé ou exception légale.
        </p>
      </section>

      <section className="rounded-[30px] border border-black/10 bg-white/82 p-6 shadow-[0_18px_45px_rgba(47,37,22,0.08)] backdrop-blur-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Politique de confidentialite</p>
        <h2 className="mt-3 text-2xl text-stone-950 sm:text-3xl">Traitements de donnees personnelles</h2>
        <p className="mt-4 text-sm leading-7 text-stone-700">
          Le site utilise certaines donnees personnelles uniquement pour faire fonctionner le compte utilisateur,
          la connexion au site et le suivi de la progression dans les quiz. Les points ci-dessous resumment de
          facon simple les usages principaux.
        </p>

        <div className="mt-6 grid gap-4">
          {privacyHighlights.map((group) => (
            <article
              key={group.title}
              className="rounded-[24px] border border-black/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(247,240,226,0.9))] p-5"
            >
              <h3 className="text-xl text-stone-950">{group.title}</h3>
              <ul className="mt-4 space-y-3 text-sm leading-7 text-stone-700">
                {group.items.map((item) => (
                  <li key={item} className="rounded-[18px] bg-white/72 px-4 py-3">
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-[30px] border border-black/10 bg-white/82 p-6 shadow-[0_18px_45px_rgba(47,37,22,0.08)] backdrop-blur-sm sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Conservation</p>
          <h2 className="mt-3 text-2xl text-stone-950">Durées de conservation</h2>
          <div className="mt-6 grid gap-4">
            {retentionRules.map((rule) => (
              <article
                key={rule.title}
                className="rounded-[24px] border border-black/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(247,240,226,0.9))] p-5"
              >
                <h3 className="text-xl text-stone-950">{rule.title}</h3>
                <p className="mt-3 text-sm leading-7 text-stone-700">{rule.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-[30px] border border-black/10 bg-white/82 p-6 shadow-[0_18px_45px_rgba(47,37,22,0.08)] backdrop-blur-sm sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Droits des personnes</p>
          <h2 className="mt-3 text-2xl text-stone-950">Exercer ses droits</h2>
          <p className="mt-4 text-sm leading-7 text-stone-700">
            Toute personne concernee peut demander l acces, la rectification ou la suppression de ses donnees, ainsi
            que toute information utile sur leur traitement. Le point de contact a afficher ici doit etre une adresse
            email effectivement geree.
          </p>

          <ul className="mt-6 grid gap-3 text-sm leading-7 text-stone-700">
            {rights.map((item) => (
              <li
                key={item}
                className="rounded-[20px] border border-black/8 bg-[var(--teal-soft)]/54 px-4 py-3"
              >
                {item}
              </li>
            ))}
          </ul>

          <div className="mt-6 rounded-[24px] border border-dashed border-amber-500/60 bg-amber-50/90 px-4 py-4 text-sm leading-7 text-amber-900">
            Contact donnees personnelles : adelinemeistertzheim40@gmail.com
          </div>
        </section>
      </div>

      <section className="rounded-[30px] border border-black/10 bg-white/82 p-6 shadow-[0_18px_45px_rgba(47,37,22,0.08)] backdrop-blur-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Cookies et traceurs</p>
        <h2 className="mt-3 text-2xl text-stone-950 sm:text-3xl">Cookies techniques utilises</h2>
        <p className="mt-4 text-sm leading-7 text-stone-700">
          Le site utilise uniquement des cookies et stockages techniques necessaires au fonctionnement de
          l authentification utilisateur. Cela inclut les cookies `dpp_access_token` et `dpp_refresh_token`,
          ainsi que l entree locale `dpp_auth_user` utilisee pour restaurer l etat de session dans l interface.
          Aucun cookie publicitaire, aucun traceur marketing et aucun outil de mesure d audience tiers ne sont
          utilises a ce jour.
        </p>
      </section>
    </div>
  )
}
