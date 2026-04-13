const workflows = {
  RELEASE_PIPELINE: {
    code: 'RELEASE_PIPELINE',
    label: 'Release Pipeline',
    description: 'Publie une version avec preparation commune, deploiement specialise et cloture stable.',
    prepareLabel: 'Preparation environnement',
    prepareDetail: 'Verifie les pre-requis, givre la version et reserve la fenetre de livraison.',
    executeLabel: 'Deploiement progressif',
    executeDetail: 'Diffuse la release par vagues sur les environnements cibles en surveillant la sante du service.',
    finalizeLabel: 'Cloture diffusion',
    finalizeDetail: 'Publie les notes de version, ferme la war room et reactive les alertes normales.',
    manualDriftDetail: 'Sans squelette commun, le deploiement se termine souvent sans cloture propre : notes oubliees et monitoring laisse en mode incident.',
    successLabel: 'Release stabilisee',
    ambianceLabel: 'pipeline delivery',
  },
  SECURITY_AUDIT: {
    code: 'SECURITY_AUDIT',
    label: 'Security Audit',
    description: 'Deroule un audit avec preparation commune, scan specialise et finalisation tracee.',
    prepareLabel: 'Preparation audit',
    prepareDetail: 'Charge les signatures, verrouille la fenetre de scan et rassemble la liste des endpoints critiques.',
    executeLabel: 'Scan de securite',
    executeDetail: 'Analyse les surfaces critiques, compare les signatures et remonte les ecarts prioritaires.',
    finalizeLabel: 'Cloture audit',
    finalizeDetail: 'Archive les preuves, publie le rapport et notifie l equipe securite.',
    manualDriftDetail: 'Sans template, le scan part bien mais la cloture varie selon l auteur : preuves partielles et notifications tardives.',
    successLabel: 'Audit trace',
    ambianceLabel: 'security workflow',
  },
  DATA_SYNC: {
    code: 'DATA_SYNC',
    label: 'Data Sync',
    description: 'Synchronise des donnees avec un canevas stable et une etape centrale personnalisee.',
    prepareLabel: 'Preparation synchronisation',
    prepareDetail: 'Ouvre les credentials, verifie le mapping et reserve le journal de reprise.',
    executeLabel: 'Synchronisation ciblee',
    executeDetail: 'Transfere les lots, applique les transformations et controle les ecarts de volume en continu.',
    finalizeLabel: 'Cloture synchronisation',
    finalizeDetail: 'Reindexe les donnees, ferme le journal de reprise et diffuse le recapitulatif d execution.',
    manualDriftDetail: 'Sans template, la synchro est relancee depuis du code copie-colle et la phase de reindexation saute facilement.',
    successLabel: 'Sync coherente',
    ambianceLabel: 'data workflow',
  },
}

function createStep(index, stageCode, stageLabel, actorLabel, status, detail, variableStage) {
  return {
    index,
    stageCode,
    stageLabel,
    actorLabel,
    status,
    detail,
    variableStage,
  }
}

function buildVisualization(templateUsed, finalizationGuaranteed) {
  return {
    nodes: [
      { id: 'client', label: 'WorkflowClient', type: 'client', data: { detail: 'launch workflow' } },
      {
        id: 'skeleton',
        label: templateUsed ? 'AbstractWorkflowTemplate' : 'ManualWorkflowCopy',
        type: 'context',
        data: {
          detail: templateUsed ? 'fixed skeleton' : 'copy pasted flow',
          active: templateUsed,
        },
      },
      { id: 'prepare', label: 'Prepare', type: 'component', data: { detail: 'shared setup', active: true } },
      { id: 'execute', label: 'Execute', type: 'component', data: { detail: 'custom hook', active: true } },
      {
        id: 'finalize',
        label: 'Finalize',
        type: 'component',
        data: {
          detail: finalizationGuaranteed ? 'guaranteed' : 'fragile cleanup',
          active: finalizationGuaranteed,
        },
      },
      {
        id: 'result',
        label: finalizationGuaranteed ? 'Workflow stable' : 'Workflow fragile',
        type: 'output',
        data: {
          message: finalizationGuaranteed ? 'stable algorithm' : 'duplicated logic drift',
        },
      },
    ],
    edges: [
      { from: 'client', to: 'skeleton', label: 'start' },
      { from: 'skeleton', to: 'prepare', label: 'prepare' },
      { from: 'prepare', to: 'execute', label: 'template step' },
      { from: 'execute', to: 'finalize', label: finalizationGuaranteed ? 'finalize' : 'manual finalize' },
      { from: 'finalize', to: 'result', label: finalizationGuaranteed ? 'stable' : 'warning' },
    ],
  }
}

export default function executeTemplatePattern(parameters) {
  const mode = `${parameters.mode ?? 'WITH_TEMPLATE_METHOD'}`.trim().toUpperCase()
  const templateUsed = mode !== 'WITHOUT_TEMPLATE_METHOD'
  const workflow = workflows[`${parameters.workflowCode ?? 'RELEASE_PIPELINE'}`.trim().toUpperCase()] ?? workflows.RELEASE_PIPELINE
  const workflowName = `${parameters.workflowName ?? ''}`.trim() || 'Workflow Builder'
  const finalizationGuaranteed = templateUsed
  const stableWorkflow = templateUsed
  const duplicateBoilerplateCount = templateUsed ? 1 : 3
  const latencyMs = templateUsed ? 240 : 390

  const steps = [
    createStep(
      1,
      'CLIENT',
      'Declenchement',
      'WorkflowClient',
      'SENT',
      `Le client lance ${workflowName} puis delegue l orchestration a ${templateUsed ? 'un squelette commun.' : 'un workflow copie-colle.'}`,
      false,
    ),
    createStep(
      2,
      'PREPARE',
      workflow.prepareLabel,
      templateUsed ? 'AbstractWorkflowTemplate' : 'ManualWorkflowCopy',
      'READY',
      templateUsed
        ? workflow.prepareDetail
        : `${workflow.prepareDetail} Cette phase est recopied dans chaque workflow manuel.`,
      false,
    ),
    createStep(
      3,
      'EXECUTE',
      workflow.executeLabel,
      workflow.label,
      'CUSTOM',
      workflow.executeDetail,
      true,
    ),
    createStep(
      4,
      'FINALIZE',
      workflow.finalizeLabel,
      templateUsed ? 'AbstractWorkflowTemplate' : 'ManualWorkflowCopy',
      finalizationGuaranteed ? 'READY' : 'FRAGILE',
      finalizationGuaranteed ? workflow.finalizeDetail : workflow.manualDriftDetail,
      false,
    ),
    createStep(
      5,
      'RESULT',
      'Etat final',
      templateUsed ? 'WorkflowTemplate' : 'ManualWorkflow',
      finalizationGuaranteed ? 'STABLE' : 'WARNING',
      finalizationGuaranteed
        ? 'Le workflow reste lisible : memes etapes communes, variation concentree sur execute().'
        : 'Le workflow aboutit, mais la fin de sequence n est plus garantie et la duplication augmente le risque de derive.',
      false,
    ),
  ]

  return {
    patternCode: 'template',
    summary: templateUsed
      ? 'Template Method conserve un squelette prepare -> execute -> finalise. Le workflow specialise ne redefinit que l etape centrale, sans dupliquer toute la recette.'
      : 'Sans Template Method, chaque workflow recopie la sequence complete. La logique commune derive, la finalisation devient fragile et le code se repete.',
    logs: [
      `Le client lance ${workflowName} sur le scenario ${workflow.label}.`,
      templateUsed
        ? 'Le squelette commun enchaine prepare() -> executeSpecificStep() -> finalize().'
        : 'Sans template method, le workflow re-implemente prepare, execute et finalize dans du code copie-colle.',
      `Prepare -> ${workflow.prepareDetail}`,
      `Execute -> ${workflow.executeDetail}`,
      `Finalize -> ${finalizationGuaranteed ? workflow.finalizeDetail : workflow.manualDriftDetail}`,
    ],
    output: {
      mode,
      modeLabel: templateUsed ? 'Avec Template Method' : 'Sans Template Method',
      workflowName,
      workflowCode: workflow.code,
      workflowLabel: workflow.label,
      workflowDescription: workflow.description,
      ambianceLabel: workflow.ambianceLabel,
      prepareLabel: workflow.prepareLabel,
      prepareDetail: workflow.prepareDetail,
      executeLabel: workflow.executeLabel,
      executeDetail: workflow.executeDetail,
      finalizeLabel: workflow.finalizeLabel,
      finalizeDetail: workflow.finalizeDetail,
      manualDriftDetail: workflow.manualDriftDetail,
      skeletonLabel: templateUsed ? 'AbstractWorkflowTemplate' : 'ManualWorkflowCopy',
      clientLabel: 'WorkflowClient',
      resultLabel: stableWorkflow ? workflow.successLabel : 'Workflow fragile',
      templateUsed,
      finalizationGuaranteed,
      stableWorkflow,
      duplicateBoilerplateCount,
      latencyMs,
      fixedStageCount: 3,
      stepCount: steps.length,
      steps,
    },
    visualization: buildVisualization(templateUsed, finalizationGuaranteed),
  }
}
