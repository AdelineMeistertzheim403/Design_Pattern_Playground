import CollapsiblePanel from '../../components/CollapsiblePanel'
import ExecutionScene from '../../components/ExecutionScene'
import UmlDiagram from '../../components/UmlDiagram'

export default function PatternVisualizationSection({
  selectedPattern,
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
        description="La scene donne une lecture runtime du pattern. Tu peux l ouvrir en grand pour inspecter les objets, les relations et les etats."
        eyebrow="Scene SVG"
        title="Visualisation interactive"
      >
        <ExecutionScene
          execution={visualExecution}
          onOpenModal={onOpenSceneModal}
          patternCode={selectedPattern.code}
          sourceLabel={visualSourceLabel}
        />
      </CollapsiblePanel>

      <CollapsiblePanel
        bodyClassName="p-0"
        description="Le diagramme UML fige la structure du pattern. Il complete la scene runtime avec la vue conception."
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
