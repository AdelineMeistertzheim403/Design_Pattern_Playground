import CollapsiblePanel from '../../components/CollapsiblePanel'
import ExecutionScene from '../../components/ExecutionScene'
import UmlDiagram from '../../components/UmlDiagram'

export default function PatternVisualizationSection({
  selectedPattern,
  svgScene,
  umlDiagram,
  visualExecution,
  visualSourceLabel,
  onOpenSceneModal,
  onOpenUmlModal,
}) {
  return (
    <section className="grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
      <CollapsiblePanel
        bodyClassName="p-0"
        description="La scène donne une lecture runtime du pattern. Tu peux l’ouvrir en grand pour inspecter les objets, les relations et les états."
        eyebrow="Scène SVG"
        title="Visualisation interactive"
      >
        <div className="mb-3 rounded-[18px] border border-blue-200 bg-blue-50 px-4 py-3 text-xs leading-6 text-blue-900">
          Les contrôles de cette zone animent uniquement la scène locale. Pour générer le retour d’exécution (summary, output, logs), utilise le bouton
          {' '}
          <span className="font-semibold">Lancer la démo (API)</span>
          {' '}
          dans la section Configuration.
        </div>
        <ExecutionScene
          customSvgScene={svgScene}
          execution={visualExecution}
          onOpenModal={onOpenSceneModal}
          patternCode={selectedPattern.code}
          sourceLabel={visualSourceLabel}
        />
      </CollapsiblePanel>

      <CollapsiblePanel
        bodyClassName="p-0"
        description="Le diagramme UML fige la structure du pattern. Il complète la scène runtime avec la vue conception."
        eyebrow="Diagramme UML"
        title="Structure du pattern"
      >
        <UmlDiagram
          diagram={umlDiagram}
          patternCode={selectedPattern.code}
          onOpenModal={onOpenUmlModal}
          patternName={selectedPattern.name}
        />
      </CollapsiblePanel>
    </section>
  )
}
