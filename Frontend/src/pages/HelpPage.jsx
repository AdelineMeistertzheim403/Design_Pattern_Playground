import { useEffect, useMemo, useState } from 'react'
import { loadFallbackSchema, loadPatternLearningContent } from '../patterns/loaders'
import { complexityLabels, typeLabels } from '../app/playgroundConstants'
import { buildMissionPath, buildPatternPath, buildSvgSceneStudioPath, buildUmlStudioPath } from '../app/playgroundUtils'
import SpaLink from '../components/SpaLink'

const tabs = [
  { id: 'patterns', label: 'Fiches pédagogiques' },
  { id: 'missions', label: 'Mode mission' },
  { id: 'uml', label: 'Éditeur UML' },
]

const fieldTypeLabels = {
  BOOLEAN: 'Interrupteur',
  LIST: 'Liste',
  NUMBER: 'Nombre',
  SELECT: 'Choix',
  TEXT: 'Texte',
}

const fieldTypeHelp = {
  BOOLEAN: 'Active ou désactive une variante du scénario.',
  LIST: 'Renseigne plusieurs valeurs, une par ligne ou séparées par des virgules.',
  NUMBER: 'Ajuste l’intensité de la démonstration sans changer le pattern.',
  SELECT: 'Choisis une option pour comparer les branches du scénario.',
  TEXT: 'Personnalise le nom affiché dans les logs, la scène ou le résultat.',
}

function formatDefaultValue(value) {
  if (value === null || value === undefined || value === '') {
    return 'Aucune valeur par défaut'
  }

  if (Array.isArray(value)) {
    return value.join(', ')
  }

  return `${value}`
}

function FieldGuide({ field }) {
  const allowedValues = Array.isArray(field.allowedValues) ? field.allowedValues : []

  return (
    <div className="rounded-lg border border-black/10 bg-white/86 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="text-sm font-semibold text-stone-950">{field.label || field.name}</h4>
        <span className="rounded-full bg-stone-100 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-stone-600">
          {fieldTypeLabels[field.type] ?? field.type}
        </span>
      </div>
      <p className="mt-2 text-sm leading-6 text-stone-700">
        {fieldTypeHelp[field.type] ?? 'Champ de configuration du scénario.'}
      </p>
      <dl className="mt-3 grid gap-2 text-xs leading-5 text-stone-600 sm:grid-cols-2">
        <div>
          <dt className="font-semibold text-stone-800">Nom technique</dt>
          <dd className="font-mono">{field.name}</dd>
        </div>
        <div>
          <dt className="font-semibold text-stone-800">Valeur initiale</dt>
          <dd>{formatDefaultValue(field.defaultValue)}</dd>
        </div>
      </dl>
      {allowedValues.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {allowedValues.map((value) => (
            <span key={value} className="rounded-full border border-black/10 bg-stone-50 px-3 py-1 text-xs font-semibold text-stone-700">
              {value}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  )
}

function PatternHelpCard({
  guide,
  isExpanded,
  onNavigatePattern,
  onToggle,
}) {
  const fields = guide.schema?.fields ?? []
  const learning = guide.learningContent ?? {}

  return (
    <article
      id={`fiche-${guide.code}`}
      className={`rounded-lg border bg-white/82 p-5 shadow-[0_12px_30px_rgba(47,37,22,0.07)] transition ${
        isExpanded ? 'border-stone-500 ring-2 ring-stone-900/10' : 'border-black/10'
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-stone-500">
            {typeLabels[guide.type] ?? guide.type} · {complexityLabels[guide.complexityLevel] ?? guide.complexityLevel}
          </p>
          <h3 className="mt-2 text-2xl text-stone-950">{guide.name}</h3>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-stone-700">{guide.description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
              isExpanded
                ? 'border-black/10 bg-white text-stone-800 hover:border-black/20'
                : 'border-stone-950 bg-stone-950 text-white hover:-translate-y-0.5'
            }`}
            type="button"
            onClick={() => onToggle(guide.code)}
          >
            {isExpanded ? 'Replier la fiche' : 'Déplier la fiche'}
          </button>
          <SpaLink
            className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-stone-800 transition hover:border-black/20"
            href={buildPatternPath(guide.code)}
            onNavigate={() => onNavigatePattern(guide.code)}
          >
            Ouvrir le pattern
          </SpaLink>
        </div>
      </div>

      {isExpanded ? (
        <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="rounded-lg bg-stone-100/80 p-4">
            <h4 className="text-sm font-semibold text-stone-950">Objectif de configuration</h4>
            <p className="mt-2 text-sm leading-7 text-stone-700">
              {learning.readingGuide || learning.studentAngle || guide.useCase}
            </p>
            {learning.steps?.length ? (
              <ol className="mt-4 space-y-2 text-sm leading-6 text-stone-700">
                {learning.steps.slice(0, 4).map((step, index) => (
                  <li key={step} className="flex gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-stone-800">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            ) : null}
          </div>

          <div className="grid gap-3">
            {fields.length ? fields.map((field) => (
              <FieldGuide key={field.name} field={field} />
            )) : (
              <div className="rounded-lg border border-black/10 bg-white/86 p-4 text-sm leading-7 text-stone-700">
                Aucun champ de configuration n’est requis pour cette démonstration.
              </div>
            )}
          </div>
        </div>
      ) : null}
    </article>
  )
}

function PatternsHelpTab({
  initialPatternCode,
  patternGuides,
  loading,
  onNavigatePattern,
}) {
  const [query, setQuery] = useState('')
  const [expandedCode, setExpandedCode] = useState(initialPatternCode ?? null)
  const filteredGuides = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    if (!normalizedQuery) {
      return patternGuides
    }

    return patternGuides.filter((guide) => (
      guide.name.toLowerCase().includes(normalizedQuery)
      || guide.description.toLowerCase().includes(normalizedQuery)
      || guide.useCase.toLowerCase().includes(normalizedQuery)
    ))
  }, [patternGuides, query])

  useEffect(() => {
    if (!initialPatternCode) {
      return
    }

    setExpandedCode(initialPatternCode)
    window.setTimeout(() => {
      document.getElementById(`fiche-${initialPatternCode}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }, 80)
  }, [initialPatternCode, loading])

  function toggleGuide(code) {
    setExpandedCode((currentCode) => (currentCode === code ? null : code))
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl text-stone-950">Configurer les design patterns</h2>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-stone-700">
            Chaque fiche explique le rôle du scénario et les champs à régler avant de lancer la démonstration.
          </p>
        </div>
        <label className="w-full max-w-sm">
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-stone-500">Rechercher</span>
          <input
            className="mt-2 w-full rounded-lg border border-black/10 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-stone-500"
            placeholder="Strategy, création, requête..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
      </div>

      {loading ? (
        <div className="rounded-lg border border-black/10 bg-white/82 p-6 text-sm leading-7 text-stone-700">
          Chargement des fiches de configuration...
        </div>
      ) : (
        <div className="grid gap-5">
          {filteredGuides.map((guide) => (
            <PatternHelpCard
              key={guide.code}
              guide={guide}
              isExpanded={expandedCode === guide.code}
              onNavigatePattern={onNavigatePattern}
              onToggle={toggleGuide}
            />
          ))}
        </div>
      )}
    </section>
  )
}

function MissionsHelpTab({ onNavigateMissions }) {
  const missionFlowItems = [
    ['Choisir une mission', 'Depuis le catalogue, filtre les scénarios par difficulté, mode ou patterns attendus, puis ouvre la mission qui correspond au sujet à travailler.'],
    ['Lire le brief', 'Repère le contexte, le problème métier, les patterns autorisés et les critères de réussite. Ce sont eux qui guident la composition de la solution.'],
    ['Composer la solution', 'Ajoute les patterns dans la zone solution, au clic ou par glisser-déposer. L’ordre sert à raconter la stratégie choisie et à guider la configuration.'],
    ['Configurer les patterns', 'Sélectionne une brique de la solution pour afficher ses champs contextualisés. Les champs critiques ont plus d’impact sur la validation.'],
    ['Lancer la mission', 'La simulation exécute les patterns, compare la solution aux contraintes de la mission et prépare une scène SVG de résultat.'],
    ['Corriger', 'Lis les retours, modifie la composition ou les paramètres, puis relance. Une mission est pensée pour être itérative.'],
  ]
  const screenAreaItems = [
    ['Catalogue', 'Présente les missions disponibles, leur difficulté, les patterns impliqués et le type d’exercice. Il sert à choisir rapidement le bon scénario.'],
    ['Colonne contexte', 'Affiche l’énoncé, les objectifs, les critères de réussite et les logs mission. C’est la référence à garder sous les yeux pendant la configuration.'],
    ['Zone solution', 'Contient les patterns choisis. Elle permet d’ajouter, retirer et organiser les briques qui composent l’architecture proposée.'],
    ['Configuration dynamique', 'Adapte les champs de chaque pattern au contexte de la mission : valeurs imposées, paramètres importants, descriptions métier et options à tester.'],
    ['Résumé de progression', 'Indique l’état courant : mission en attente, à corriger ou réussie, avec le nombre de patterns sélectionnés et la qualité estimée.'],
    ['Résultat', 'Affiche le verdict, les points validés, les manques, les recommandations et la scène SVG de simulation.'],
  ]
  const resultItems = [
    ['Mission réussie', 'La composition couvre les besoins principaux et les paramètres choisis respectent les critères de réussite.'],
    ['Mission à corriger', 'La direction peut être bonne, mais il manque un pattern, un réglage critique ou une cohérence entre les briques.'],
    ['Points validés', 'Liste les éléments correctement couverts par la solution : responsabilité séparée, flux protégé, objet partagé, notification correcte, etc.'],
    ['Points à revoir', 'Indique ce qui fragilise encore l’architecture : mauvaise brique, configuration trop générique, condition absente ou scénario incomplet.'],
    ['Scène SVG', 'Visualise la mission sous forme de flux animé. Les étapes permettent de comprendre où chaque pattern intervient dans le scénario.'],
  ]
  const adviceItems = [
    ['Partir du problème, pas du pattern', 'Commence par identifier ce qui doit varier, être protégé, être partagé, être notifié ou être orchestré. Le pattern vient ensuite.'],
    ['Limiter la solution', 'N’ajoute pas tous les patterns disponibles. Une solution réaliste utilise les briques nécessaires, sans empiler des responsabilités inutiles.'],
    ['Soigner les champs critiques', 'Les paramètres marqués comme importants influencent fortement l’évaluation. Ils doivent correspondre au brief, pas seulement à une valeur plausible.'],
    ['Comparer avec la fiche du pattern', 'Si un comportement semble flou, ouvre la fiche pédagogique du pattern pour revoir son intention et ses champs de configuration.'],
  ]

  return (
    <section className="space-y-8">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <div>
          <h2 className="text-3xl text-stone-950">Comprendre le mode mission</h2>
          <p className="mt-3 text-sm leading-7 text-stone-700">
            Le mode mission transforme les design patterns en exercices guidés. Tu dois lire un problème métier, composer une solution avec un ou plusieurs patterns, ajuster leurs paramètres, puis vérifier si l’architecture répond réellement aux contraintes.
          </p>
          <p className="mt-3 text-sm leading-7 text-stone-700">
            L’objectif n’est pas seulement de trouver le bon nom de pattern : il faut expliquer pourquoi il est utile dans ce contexte et le configurer avec des valeurs cohérentes.
          </p>
          <SpaLink
            className="mt-5 inline-flex rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"
            href={buildMissionPath()}
            onNavigate={onNavigateMissions}
          >
            Ouvrir le mode mission
          </SpaLink>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {[
            ['Scénario', 'Chaque mission part d’un cas concret : performance, sécurité, orchestration, création d’objets ou communication.'],
            ['Composition', 'La solution peut demander un seul pattern ou une combinaison de plusieurs briques complémentaires.'],
            ['Configuration', 'Les champs ne sont pas décoratifs : ils traduisent les choix d’architecture attendus par la mission.'],
            ['Validation', 'Le résultat compare les patterns choisis, les paramètres et les critères de réussite du brief.'],
          ].map(([title, text]) => (
            <div key={title} className="rounded-lg border border-black/10 bg-white/84 p-5">
              <h3 className="text-xl text-stone-950">{title}</h3>
              <p className="mt-2 text-sm leading-7 text-stone-700">{text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <HelpReferenceCard
          title="Déroulement d’une mission"
          intro="Suis ces étapes pour passer d’un énoncé à une solution validée."
          items={missionFlowItems}
        />
        <HelpReferenceCard
          title="Zones de l’écran"
          intro="Chaque zone a un rôle précis dans la préparation ou l’analyse."
          items={screenAreaItems}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <HelpReferenceCard
          title="Lire le résultat"
          intro="Le verdict sert à comprendre quoi garder et quoi corriger."
          items={resultItems}
        />
        <HelpReferenceCard
          title="Conseils de résolution"
          intro="Ces repères aident à produire une solution réaliste."
          items={adviceItems}
        />
      </div>
    </section>
  )
}

function HelpReferenceCard({ title, intro, items }) {
  return (
    <article className="rounded-lg border border-black/10 bg-white/84 p-5">
      <h3 className="text-xl text-stone-950">{title}</h3>
      {intro ? (
        <p className="mt-2 text-sm leading-7 text-stone-700">{intro}</p>
      ) : null}
      <dl className="mt-4 grid gap-3">
        {items.map(([label, text]) => (
          <div key={label} className="rounded-lg bg-stone-100/70 p-4">
            <dt className="text-sm font-semibold text-stone-950">{label}</dt>
            <dd className="mt-1 text-sm leading-6 text-stone-700">{text}</dd>
          </div>
        ))}
      </dl>
    </article>
  )
}

function UmlHelpTab({ onNavigateSvgSceneStudio, onNavigateUmlStudio }) {
  const umlToolbarItems = [
    ['Nom du diagramme', 'Renomme le document affiché dans l’éditeur, les sauvegardes et les exports.'],
    ['Annuler', 'Revient sur la dernière modification de structure ou de mise en page.'],
    ['Sauvegarder', 'Conserve le diagramme courant. Avec un compte connecté, la sauvegarde peut aussi être retrouvée côté espace utilisateur.'],
    ['Aperçu', 'Ouvre le rendu final dans une fenêtre de prévisualisation sans quitter l’éditeur.'],
    ['Exporter en SVG', 'Télécharge un fichier vectoriel pratique pour intégrer le diagramme dans une page ou un support.'],
    ['Exporter en PNG', 'Télécharge une image bitmap plus simple à partager dans un document ou une présentation.'],
  ]
  const umlPaletteItems = [
    ['Boîte UML', 'Ajoute une classe avec un titre, un stéréotype, des attributs et des méthodes. Disponible pour les diagrammes de classes.'],
    ['Départ, arrivée, action, condition', 'Ajoute les étapes principales d’un diagramme d’activité : début, fin, tâche utilisateur ou branche conditionnelle.'],
    ['Flèche / relation', 'Crée le lien entre deux éléments. Le type de marqueur, le tracé et les points intermédiaires se règlent ensuite dans l’inspecteur.'],
    ['Zone de texte', 'Ajoute une annotation libre pour préciser une intention, une contrainte ou une règle métier.'],
    ['Largeur et hauteur', 'Ajuste la taille de la zone de dessin quand le diagramme devient trop dense.'],
    ['Zoom', 'Rapproche ou éloigne la vue sans modifier la taille réelle du diagramme. Le bouton 100 % revient à l’échelle normale.'],
    ['Quadrillage', 'Affiche une grille de repère pour aligner plus facilement les éléments.'],
  ]
  const umlInspectorItems = [
    ['Élément sélectionné', 'Modifie le libellé, le type d’étape, le stéréotype, la position, les dimensions, les couleurs et le contenu des zones attributs ou méthodes.'],
    ['Relation sélectionnée', 'Change l’étiquette, les éléments de départ et d’arrivée, les côtés d’accroche, le marqueur, le style droit ou courbe, les angles intermédiaires, les pointillés et la couleur.'],
    ['Texte sélectionné', 'Édite le texte, la position, la taille du bloc, la taille de police et les couleurs de l’annotation.'],
    ['Supprimer', 'Retire l’élément, la relation ou le texte sélectionné du diagramme courant.'],
  ]
  const svgToolbarItems = [
    ['Nom de la scène', 'Renomme la scène SVG utilisée pour les aperçus, les exports et les sauvegardes.'],
    ['Annuler', 'Annule la dernière modification faite dans la scène.'],
    ['Sauvegarder', 'Conserve la scène personnalisée pour la réutiliser ensuite.'],
    ['Aperçu', 'Lance une prévisualisation de la scène et de ses animations.'],
    ['Exporter en SVG', 'Génère le fichier SVG final, adapté à une intégration web.'],
    ['Exporter en PNG', 'Convertit la scène en image PNG pour un partage plus direct.'],
  ]
  const svgPaletteItems = [
    ['Boîte', 'Ajoute un bloc rectangulaire pour représenter un composant, un service, une étape ou une responsabilité.'],
    ['Nœud', 'Ajoute un élément visuel plus compact pour représenter un acteur, un objet ou un point de passage.'],
    ['Texte', 'Ajoute une annotation autonome dans la scène.'],
    ['Flèche', 'Relie deux éléments et peut être animée pour montrer un flux, un appel ou une dépendance.'],
    ['Charger les éléments du pattern', 'Importe les éléments disponibles d’un design pattern afin de construire une scène cohérente avec sa démonstration.'],
    ['Ajouter', 'Insère dans la scène l’élément importé choisi dans la liste.'],
    ['Largeur, hauteur et quadrillage', 'Règle la taille du canevas SVG et affiche une grille pour placer les éléments proprement.'],
    ['Mode d’animation', 'Choisit entre une animation automatique ou une lecture pas à pas pour présenter le scénario progressivement.'],
  ]
  const svgInspectorItems = [
    ['Élément sélectionné', 'Modifie le libellé, le sous-titre, la couleur, la position, les dimensions, la taille du texte et l’animation d’apparition.'],
    ['Calques', 'Monte ou descend l’élément sélectionné pour gérer ce qui passe devant ou derrière dans la scène.'],
    ['SVG importé', 'Permet d’ajuster le balisage SVG brut d’un élément importé quand une correction fine est nécessaire.'],
    ['Flèche sélectionnée', 'Règle l’étiquette, les pointillés, la courbure, l’ordre d’animation, la durée, le délai, la couleur animée et la taille du point de déplacement.'],
    ['Supprimer', 'Retire l’élément ou la flèche sélectionné de la scène.'],
  ]

  return (
    <section className="space-y-8">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <div>
          <h2 className="text-3xl text-stone-950">Éditeurs visuels</h2>
          <p className="mt-3 text-sm leading-7 text-stone-700">
            Les éditeurs servent à construire des supports lisibles autour des design patterns. L’éditeur UML clarifie les classes, les activités et les relations. L’éditeur de scène SVG prépare des scènes animées pour expliquer un scénario ou personnaliser une démonstration.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <SpaLink
              className="inline-flex rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"
              href={buildUmlStudioPath()}
              onNavigate={onNavigateUmlStudio}
            >
              Ouvrir l’éditeur UML
            </SpaLink>
            <SpaLink
              className="inline-flex rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-stone-800 transition hover:border-black/20"
              href={buildSvgSceneStudioPath()}
              onNavigate={onNavigateSvgSceneStudio}
            >
              Ouvrir l’éditeur de scène SVG
            </SpaLink>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {[
            ['Créer', 'Pars d’un document vide ou d’un modèle de pattern pour poser les éléments principaux.'],
            ['Organiser', 'Place les blocs, ajuste les dimensions et utilise la grille pour garder une lecture propre.'],
            ['Expliquer', 'Ajoute des textes, des libellés et des flèches pour rendre le raisonnement explicite.'],
            ['Partager', 'Prévisualise, sauvegarde puis exporte en SVG ou PNG selon le support visé.'],
          ].map(([title, text]) => (
            <div key={title} className="rounded-lg border border-black/10 bg-white/84 p-5">
              <h3 className="text-xl text-stone-950">{title}</h3>
              <p className="mt-2 text-sm leading-7 text-stone-700">{text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-stone-500">Éditeur UML</p>
          <h3 className="mt-2 text-2xl text-stone-950">Diagrammes de classes et d’activités</h3>
          <p className="mt-2 max-w-4xl text-sm leading-7 text-stone-700">
            Utilise-le pour représenter les responsabilités, les dépendances, les flux d’activité et les variantes d’un pattern. Sélectionne un objet sur le canevas pour afficher ses réglages dans l’inspecteur.
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <HelpReferenceCard
            title="Barre d’actions"
            intro="Ces contrôles concernent le document entier."
            items={umlToolbarItems}
          />
          <HelpReferenceCard
            title="Palette"
            intro="Ces boutons ajoutent ou ajustent les objets visibles sur le canevas."
            items={umlPaletteItems}
          />
          <HelpReferenceCard
            title="Inspecteur"
            intro="Ce panneau détaille l’objet sélectionné."
            items={umlInspectorItems}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-stone-500">Éditeur de scène SVG</p>
          <h3 className="mt-2 text-2xl text-stone-950">Scènes visuelles et animations</h3>
          <p className="mt-2 max-w-4xl text-sm leading-7 text-stone-700">
            Utilise-le pour créer une scène explicative autour d’un pattern : composants, acteurs, messages, flux animés et éléments importés depuis les démonstrations existantes.
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <HelpReferenceCard
            title="Barre d’actions"
            intro="Ces contrôles gèrent la scène complète."
            items={svgToolbarItems}
          />
          <HelpReferenceCard
            title="Palette"
            intro="Ces boutons construisent la scène et son contexte visuel."
            items={svgPaletteItems}
          />
          <HelpReferenceCard
            title="Inspecteur"
            intro="Ce panneau règle précisément l’objet ou la flèche sélectionnée."
            items={svgInspectorItems}
          />
        </div>
      </div>
    </section>
  )
}

export default function HelpPage({
  initialHelpSection,
  initialPatternCode,
  patterns,
  onNavigateMissions,
  onNavigatePattern,
  onNavigateSvgSceneStudio,
  onNavigateUmlStudio,
}) {
  const [activeTab, setActiveTab] = useState(initialHelpSection ?? 'patterns')
  const [patternGuides, setPatternGuides] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setActiveTab(initialHelpSection ?? (initialPatternCode ? 'patterns' : 'patterns'))
  }, [initialHelpSection, initialPatternCode])

  useEffect(() => {
    let ignore = false

    async function loadGuides() {
      setLoading(true)
      const guides = await Promise.all(
        patterns.map(async (pattern) => {
          const [schema, learningContent] = await Promise.all([
            loadFallbackSchema(pattern.code),
            loadPatternLearningContent(pattern.code),
          ])

          return {
            ...pattern,
            learningContent,
            schema,
          }
        }),
      )

      if (!ignore) {
        setPatternGuides(guides)
        setLoading(false)
      }
    }

    loadGuides()

    return () => {
      ignore = true
    }
  }, [patterns])

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <section className="rounded-lg border border-black/10 bg-white/82 p-6 shadow-[0_18px_45px_rgba(47,37,22,0.08)] sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-stone-500">Centre d’aide</p>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-5">
          <div>
            <h1 className="text-4xl text-stone-950 sm:text-5xl">Aide Design Pattern Playground</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-stone-700">
              Retrouve les fiches de configuration, le fonctionnement des missions et les repères essentiels pour construire des diagrammes UML lisibles.
            </p>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap gap-2 rounded-lg border border-black/10 bg-white/70 p-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`rounded-lg px-4 py-3 text-sm font-semibold transition ${
              activeTab === tab.id
                ? 'bg-stone-950 text-white shadow-[0_10px_20px_rgba(47,37,22,0.16)]'
                : 'text-stone-700 hover:bg-white'
            }`}
            type="button"
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="rounded-lg border border-black/10 bg-white/62 p-5 shadow-[0_18px_45px_rgba(47,37,22,0.08)] sm:p-6">
        {activeTab === 'patterns' ? (
          <PatternsHelpTab
            initialPatternCode={initialPatternCode}
            loading={loading}
            patternGuides={patternGuides}
            onNavigatePattern={onNavigatePattern}
          />
        ) : activeTab === 'missions' ? (
          <MissionsHelpTab onNavigateMissions={onNavigateMissions} />
        ) : (
          <UmlHelpTab
            onNavigateSvgSceneStudio={onNavigateSvgSceneStudio}
            onNavigateUmlStudio={onNavigateUmlStudio}
          />
        )}
      </div>
    </div>
  )
}
