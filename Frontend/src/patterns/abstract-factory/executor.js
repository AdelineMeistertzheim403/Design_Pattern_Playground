const themeProfiles = {
  SCI_FI: {
    code: 'SCI_FI',
    label: 'Sci-Fi',
    factoryClassName: 'SciFiThemeFactory',
    familyLabel: 'Neon strike pack',
    moodLabel: 'Neon, metal et interfaces holographiques.',
    driftThemeLabel: 'Medieval',
    hero: {
      slotCode: 'HERO',
      slotLabel: 'Hero',
      className: 'SpacePilot',
      label: 'Nova Pilot',
      detail:
        'Pilote tactique concu pour des environnements orbitaux et des missions a haute vitesse.',
    },
    transport: {
      slotCode: 'TRANSPORT',
      slotLabel: 'Transport',
      className: 'HoverBike',
      label: 'Pulse Hoverbike',
      detail:
        'Vehicule leger a sustentation magnetique parfait pour garder une silhouette futuriste coherente.',
    },
    relic: {
      slotCode: 'RELIC',
      slotLabel: 'Relic',
      className: 'PlasmaRelic',
      label: 'Quantum Core',
      detail:
        'Artefact lumineux qui alimente l univers visuel et le gameplay du theme.',
    },
    driftArtifact: {
      slotCode: 'TRANSPORT',
      slotLabel: 'Transport',
      className: 'WarHorse',
      label: 'Iron Warhorse',
      detail:
        'Monture lourde issue d un autre univers. Elle casse immediatement la coherence de famille.',
    },
  },
  MEDIEVAL: {
    code: 'MEDIEVAL',
    label: 'Medieval',
    factoryClassName: 'MedievalThemeFactory',
    familyLabel: 'Castle defense pack',
    moodLabel: 'Pierre, cuir, bannieres et artisanat heroique.',
    driftThemeLabel: 'Sci-Fi',
    hero: {
      slotCode: 'HERO',
      slotLabel: 'Hero',
      className: 'KnightChampion',
      label: 'Knight Champion',
      detail:
        'Champion de melee bati pour les remparts, les parades et le duel frontal.',
    },
    transport: {
      slotCode: 'TRANSPORT',
      slotLabel: 'Transport',
      className: 'WarHorse',
      label: 'Iron Warhorse',
      detail:
        'Monture blindee qui garde la famille medievale lisible et homogene.',
    },
    relic: {
      slotCode: 'RELIC',
      slotLabel: 'Relic',
      className: 'RunicBanner',
      label: 'Runic Banner',
      detail:
        'Relique de commandement qui porte les couleurs et la magie du royaume.',
    },
    driftArtifact: {
      slotCode: 'TRANSPORT',
      slotLabel: 'Transport',
      className: 'HoverBike',
      label: 'Pulse Hoverbike',
      detail:
        'Vehicule a sustentation venu d un autre theme. Il cree une rupture immediate dans la famille.',
    },
  },
}

function toStep(index, stageCode, title, actorLabel, detail, coherentFamily, usesFactory) {
  return {
    index,
    stageCode,
    title,
    actorLabel,
    detail,
    coherentFamily,
    usesFactory,
  }
}

export default function executeAbstractFactoryPattern(parameters) {
  const mode = `${parameters.mode ?? 'WITH_ABSTRACT_FACTORY'}`.trim().toUpperCase()
  const useFactory = mode !== 'WITHOUT_ABSTRACT_FACTORY'
  const theme =
    themeProfiles[`${parameters.themeCode ?? 'SCI_FI'}`.trim().toUpperCase()] ?? themeProfiles.SCI_FI
  const generatorLabel = `${parameters.generatorLabel ?? ''}`.trim() || 'Theme Generator'
  const artifacts = useFactory
    ? [theme.hero, theme.transport, theme.relic]
    : [theme.hero, theme.driftArtifact, theme.relic]
  const coherentFamily = useFactory

  const steps = [
    toStep(
      1,
      'SELECT_THEME',
      'Selection du theme',
      generatorLabel,
      `Le client choisit ${theme.label} comme famille cible.`,
      coherentFamily,
      useFactory,
    ),
    toStep(
      2,
      useFactory ? 'FACTORY' : 'MANUAL',
      useFactory ? 'Choix de la factory' : 'Assemblage manuel',
      useFactory ? theme.factoryClassName : 'ThemePickerClient',
      useFactory
        ? `${theme.factoryClassName} garantit que hero, transport et relique viennent du meme univers.`
        : `Le client selectionne les objets un par un. Rien ne bloque un melange entre ${theme.label} et ${theme.driftThemeLabel}.`,
      coherentFamily,
      useFactory,
    ),
    toStep(
      3,
      'GENERATE_FAMILY',
      'Generation des objets',
      useFactory ? theme.factoryClassName : 'ThemePickerClient',
      `${artifacts[0].label}, ${artifacts[1].label} et ${artifacts[2].label} sont instancies.`,
      coherentFamily,
      useFactory,
    ),
    toStep(
      4,
      'VERIFY',
      'Verification de coherence',
      'Theme Analyzer',
      coherentFamily
        ? 'Les trois objets partagent la meme direction artistique. Le theme reste lisible de bout en bout.'
        : `${artifacts[1].label} vient du theme ${theme.driftThemeLabel} et casse la coherence de la famille.`,
      coherentFamily,
      useFactory,
    ),
  ]

  return {
    patternCode: 'abstract-factory',
    summary: useFactory
      ? "Abstract Factory cree toute une famille d objets coherente depuis un theme unique. Le client demande une ambiance, pas des classes concretes dispersees."
      : "Sans Abstract Factory, le client assemble chaque produit a la main. Il suffit d un mauvais choix pour casser la coherence de la famille complete.",
    logs: [
      `${generatorLabel} recoit la demande pour le theme ${theme.label}.`,
      useFactory
        ? `${theme.factoryClassName} prend en charge toute la famille d objets.`
        : 'Le client selectionne manuellement chaque produit concret.',
      `Hero -> ${artifacts[0].label}.`,
      `Transport -> ${artifacts[1].label}.`,
      `Relic -> ${artifacts[2].label}.`,
      coherentFamily
        ? 'La famille reste coherente et extensible.'
        : 'La famille derive : un produit appartient a un autre univers visuel.',
    ],
    output: {
      mode,
      modeLabel: useFactory ? 'Avec Abstract Factory' : 'Sans Abstract Factory',
      generatorLabel,
      themeCode: theme.code,
      themeLabel: theme.label,
      factoryClassName: theme.factoryClassName,
      familyLabel: theme.familyLabel,
      moodLabel: theme.moodLabel,
      coherentFamily,
      resultLabel: coherentFamily ? 'Theme coherent' : 'Family drift',
      manualTouchCount: useFactory ? 1 : 3,
      familySize: 3,
      driftThemeLabel: coherentFamily ? '' : theme.driftThemeLabel,
      hero: artifacts[0],
      transport: artifacts[1],
      relic: artifacts[2],
      stepCount: steps.length,
      steps,
    },
    visualization: {
      nodes: [
        { id: 'client', label: generatorLabel, type: 'client', data: { detail: theme.label } },
        {
          id: 'factory',
          label: useFactory ? theme.factoryClassName : 'Manual assembly',
          type: useFactory ? 'factory' : 'cluster',
          data: { detail: useFactory ? 'family creation' : 'concrete picks' },
        },
        { id: 'hero', label: artifacts[0].label, type: 'product', data: { detail: artifacts[0].className, active: true } },
        { id: 'transport', label: artifacts[1].label, type: 'product', data: { detail: artifacts[1].className, active: coherentFamily } },
        { id: 'relic', label: artifacts[2].label, type: 'product', data: { detail: artifacts[2].className, active: true } },
        {
          id: 'result',
          label: coherentFamily ? 'Coherent family' : 'Family drift',
          type: 'output',
          data: { message: coherentFamily ? theme.familyLabel : 'theme mismatch' },
        },
      ],
      edges: [
        { from: 'client', to: 'factory', label: useFactory ? 'request family' : 'pick each' },
        { from: 'factory', to: 'hero', label: 'create hero' },
        { from: 'factory', to: 'transport', label: useFactory ? 'create transport' : 'manual pick' },
        { from: 'factory', to: 'relic', label: 'create relic' },
        { from: 'factory', to: 'result', label: coherentFamily ? 'coherent' : 'mismatch' },
      ],
    },
  }
}
