const themeProfiles = {
  SCI_FI: {
    code: 'SCI_FI',
    label: 'Sci-Fi',
    factoryClassName: 'SciFiThemeFactory',
    familyLabel: 'Neon strike pack',
    moodLabel: 'Néon, métal et interfaces holographiques.',
    driftThemeLabel: 'Médiéval',
    hero: {
      slotCode: 'HERO',
      slotLabel: 'Héros',
      className: 'SpacePilot',
      label: 'Nova Pilot',
      detail:
        'Pilote tactique conçu pour des environnements orbitaux et des missions à haute vitesse.',
    },
    transport: {
      slotCode: 'TRANSPORT',
      slotLabel: 'Transport',
      className: 'HoverBike',
      label: 'Pulse Hoverbike',
      detail:
        'Véhicule léger à sustentation magnétique parfait pour garder une silhouette futuriste cohérente.',
    },
    relic: {
      slotCode: 'RELIC',
      slotLabel: 'Relique',
      className: 'PlasmaRelic',
      label: 'Quantum Core',
      detail:
        "Artefact lumineux qui alimente l'univers visuel et le gameplay du thème.",
    },
    driftArtifact: {
      slotCode: 'TRANSPORT',
      slotLabel: 'Transport',
      className: 'WarHorse',
      label: 'Iron Warhorse',
      detail:
        "Monture lourde issue d'un autre univers. Elle casse immédiatement la cohérence de famille.",
    },
  },
  MEDIEVAL: {
    code: 'MEDIEVAL',
    label: 'Médiéval',
    factoryClassName: 'MedievalThemeFactory',
    familyLabel: 'Castle defense pack',
    moodLabel: 'Pierre, cuir, bannières et artisanat héroïque.',
    driftThemeLabel: 'Sci-Fi',
    hero: {
      slotCode: 'HERO',
      slotLabel: 'Héros',
      className: 'KnightChampion',
      label: 'Knight Champion',
      detail:
        'Champion de mêlée bâti pour les remparts, les parades et le duel frontal.',
    },
    transport: {
      slotCode: 'TRANSPORT',
      slotLabel: 'Transport',
      className: 'WarHorse',
      label: 'Iron Warhorse',
      detail:
        'Monture blindée qui garde la famille médiévale lisible et homogène.',
    },
    relic: {
      slotCode: 'RELIC',
      slotLabel: 'Relique',
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
        "Véhicule à sustentation venu d'un autre thème. Il crée une rupture immédiate dans la famille d'objets.",
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
  const generatorLabel = `${parameters.generatorLabel ?? ''}`.trim() || 'Générateur de thème'
  const artifacts = useFactory
    ? [theme.hero, theme.transport, theme.relic]
    : [theme.hero, theme.driftArtifact, theme.relic]
  const coherentFamily = useFactory

  const steps = [
    toStep(
      1,
      'SELECT_THEME',
      'Sélection du thème',
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
        ? `${theme.factoryClassName} garantit que héros, transport et relique viennent du même univers.`
        : `Le client sélectionne les objets un par un. Rien ne bloque un mélange entre ${theme.label} et ${theme.driftThemeLabel}.`,
      coherentFamily,
      useFactory,
    ),
    toStep(
      3,
      'GENERATE_FAMILY',
      'Génération des objets',
      useFactory ? theme.factoryClassName : 'ThemePickerClient',
      `${artifacts[0].label}, ${artifacts[1].label} et ${artifacts[2].label} sont instanciés.`,
      coherentFamily,
      useFactory,
    ),
    toStep(
      4,
      'VERIFY',
      'Vérification de cohérence',
      'Analyseur de thème',
      coherentFamily
        ? 'Les trois objets partagent la même direction artistique. Le thème reste lisible de bout en bout.'
        : `${artifacts[1].label} vient du thème ${theme.driftThemeLabel} et casse la cohérence de la famille.`,
      coherentFamily,
      useFactory,
    ),
  ]

  return {
    patternCode: 'abstract-factory',
    summary: useFactory
      ? "Abstract Factory crée toute une famille d’objets cohérente depuis un thème unique. Le client demande une ambiance, pas des classes concrètes dispersées."
      : "Sans Abstract Factory, le client assemble chaque produit à la main. Il suffit d'un mauvais choix pour casser la cohérence de la famille complète.",
    logs: [
      `${generatorLabel} reçoit la demande pour le thème ${theme.label}.`,
      useFactory
        ? `${theme.factoryClassName} prend en charge toute la famille d’objets.`
        : 'Le client sélectionne manuellement chaque produit concret.',
      `Héros -> ${artifacts[0].label}.`,
      `Transport -> ${artifacts[1].label}.`,
      `Relique -> ${artifacts[2].label}.`,
      coherentFamily
        ? 'La famille reste cohérente et extensible.'
        : 'La famille dérive : un produit appartient à un autre univers visuel.',
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
      resultLabel: coherentFamily ? 'Thème cohérent' : 'Dérive de famille',
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
          label: useFactory ? theme.factoryClassName : 'Assemblage manuel',
          type: useFactory ? 'factory' : 'cluster',
          data: { detail: useFactory ? 'création de famille' : 'sélections concrètes' },
        },
        { id: 'hero', label: artifacts[0].label, type: 'product', data: { detail: artifacts[0].className, active: true } },
        { id: 'transport', label: artifacts[1].label, type: 'product', data: { detail: artifacts[1].className, active: coherentFamily } },
        { id: 'relic', label: artifacts[2].label, type: 'product', data: { detail: artifacts[2].className, active: true } },
        {
          id: 'result',
          label: coherentFamily ? 'Famille cohérente' : 'Dérive de famille',
          type: 'output',
          data: { message: coherentFamily ? theme.familyLabel : 'mélange de thèmes' },
        },
      ],
      edges: [
        { from: 'client', to: 'factory', label: useFactory ? 'demande famille' : 'choisit chaque objet' },
        { from: 'factory', to: 'hero', label: 'crée héros' },
        { from: 'factory', to: 'transport', label: useFactory ? 'crée transport' : 'choix manuel' },
        { from: 'factory', to: 'relic', label: 'crée relique' },
        { from: 'factory', to: 'result', label: coherentFamily ? 'cohérent' : 'incohérent' },
      ],
    },
  }
}
