import { createElement } from 'react'
import ZoomableViewport from '../../components/ZoomableViewport'
import {
  EmptyScenePlaceholder,
  SceneMetaBadges,
  safeNumber,
} from '../shared/sceneShared'

function extractSingletonModel(execution) {
  const output = execution?.output

  if (!output || output.instanceCount === undefined || !Array.isArray(output.clientViews)) {
    return null
  }

  const clientViews = output.clientViews.map((view, index) => ({
    id: `client-view-${index}`,
    client: `${view.client ?? `Client ${index + 1}`}`,
    instanceId: `${view.instanceId ?? `instance-${index + 1}`}`,
    visibleValue: `${view.visibleValue ?? 'non defini'}`,
    shared: Boolean(view.shared),
  }))

  return {
    mode: `${output.mode ?? 'WITH_SINGLETON'}`,
    modeLabel: `${output.modeLabel ?? 'Avec Singleton'}`,
    writerClient: `${output.writerClient ?? clientViews[0]?.client ?? 'Client 1'}`,
    settingKey: `${output.settingKey ?? 'theme'}`,
    settingValue: `${output.settingValue ?? 'emerald'}`,
    instanceCount: safeNumber(output.instanceCount, clientViews.length),
    clientCount: safeNumber(output.clientCount, clientViews.length),
    coherent: Boolean(output.coherent),
    coherenceLabel: `${output.coherenceLabel ?? ''}`.trim() || 'Etat en cours',
    uniqueInstanceIds: Array.isArray(output.uniqueInstanceIds)
      ? output.uniqueInstanceIds.map((value) => `${value}`)
      : [...new Set(clientViews.map((view) => view.instanceId))],
    clientViews,
  }
}

export default function SingletonScene({
  execution,
  isExpanded,
  panelClassName,
  svgClassName,
  TitleTag,
  sourceLabel,
  onOpenModal,
}) {
  const model = extractSingletonModel(execution)

  if (!model) {
    return <EmptyScenePlaceholder />
  }

  const viewBoxWidth = 1120
  const clientCardHeight = 82
  const clientGap = 22
  const clientsHeight = model.clientViews.length * clientCardHeight + Math.max(0, model.clientViews.length - 1) * clientGap
  const viewBoxHeight = Math.max(isExpanded ? 760 : 660, 240 + clientsHeight)
  const defsId = `singleton-scene-${isExpanded ? 'expanded' : 'compact'}`
  const clientColumnX = 48
  const clientColumnY = 156
  const clientCardWidth = 268
  const metricsX = 392
  const metricsY = 52
  const metricsWidth = 680
  const metricsHeight = 108
  const instanceColumnX = 590
  const singleInstanceWidth = 414
  const singleInstanceHeight = 196
  const singleInstanceY = 214
  const stackedInstanceWidth = 372
  const stackedInstanceHeight = 92
  const stackedInstanceGap = 26
  const useSingleton = model.mode === 'WITH_SINGLETON' || model.instanceCount === 1
  const uniqueInstanceIds = model.uniqueInstanceIds
  const instanceViews = uniqueInstanceIds.map((instanceId) => ({
    instanceId,
    visibleValue: model.clientViews.find((view) => view.instanceId === instanceId)?.visibleValue ?? 'non defini',
    clients: model.clientViews.filter((view) => view.instanceId === instanceId).map((view) => view.client),
  }))
  const totalInstancesHeight = instanceViews.length * stackedInstanceHeight + Math.max(0, instanceViews.length - 1) * stackedInstanceGap
  const stackedStartY = Math.max(176, (viewBoxHeight - totalInstancesHeight) / 2)

  const buildPath = (startX, startY, endX, endY) => {
    const curve = Math.max(82, (endX - startX) * 0.38)
    return `M ${startX} ${startY} C ${startX + curve} ${startY} ${endX - curve} ${endY} ${endX} ${endY}`
  }

  const connectionEntries = model.clientViews.map((view, index) => {
    const clientY = clientColumnY + index * (clientCardHeight + clientGap)
    const sourceX = clientColumnX + clientCardWidth
    const sourceY = clientY + clientCardHeight / 2

    if (useSingleton) {
      return {
        key: `${view.client}-${view.instanceId}`,
        path: buildPath(sourceX, sourceY, instanceColumnX, singleInstanceY + singleInstanceHeight / 2),
        highlight: view.client === model.writerClient,
      }
    }

    const instanceIndex = instanceViews.findIndex((instance) => instance.instanceId === view.instanceId)
    const targetY = stackedStartY + instanceIndex * (stackedInstanceHeight + stackedInstanceGap)

    return {
      key: `${view.client}-${view.instanceId}`,
      path: buildPath(sourceX, sourceY, instanceColumnX, targetY + stackedInstanceHeight / 2),
      highlight: view.client === model.writerClient,
    }
  })

  return (
    <div className={panelClassName}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 px-2 pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Scene SVG</p>
          {createElement(TitleTag, { className: isExpanded ? 'mt-2 text-3xl text-stone-950 sm:text-[2.1rem]' : 'mt-2 text-2xl text-stone-950' }, 'Shared Instance Dashboard')}
        </div>
        <SceneMetaBadges execution={execution} onOpenModal={onOpenModal} sourceLabel={sourceLabel} />
      </div>

      <ZoomableViewport enabled={false} viewportClassName={isExpanded ? 'mt-6' : 'mt-4'}>
        <svg className={svgClassName} viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`} role="img">
          <defs>
            <linearGradient id={`${defsId}-metrics`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,249,239,0.98)" />
              <stop offset="100%" stopColor="rgba(211,236,230,0.84)" />
            </linearGradient>
            <marker id={`${defsId}-arrow`} markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill={useSingleton ? '#246b5e' : '#426c8d'} />
            </marker>
          </defs>

          <circle cx="164" cy="108" r="104" fill="rgba(36,107,94,0.08)" />
          <circle cx="972" cy={viewBoxHeight - 102} r="124" fill="rgba(194,87,55,0.08)" />

          <rect
            x={metricsX}
            y={metricsY}
            width={metricsWidth}
            height={metricsHeight}
            rx="34"
            fill={`url(#${defsId}-metrics)`}
            stroke="rgba(36,31,24,0.1)"
            strokeWidth="2"
          />
          <text x={metricsX + 28} y={metricsY + 34} fontSize="11" fontWeight="700" letterSpacing="0.18em" fill="#5f5548">
            SINGLETON CHECK
          </text>
          <text x={metricsX + 28} y={metricsY + 68} fontSize="30" fontWeight="700" fill="#241f18">
            {model.modeLabel}
          </text>
          <text x={metricsX + 28} y={metricsY + 95} fontSize="14" fill="#5f5548">
            {model.coherenceLabel}
          </text>
          <text x={metricsX + metricsWidth - 28} y={metricsY + 62} textAnchor="end" fontSize="25" fontWeight="700" fill="#241f18">
            {model.instanceCount} instance(s)
          </text>
          <text x={metricsX + metricsWidth - 28} y={metricsY + 92} textAnchor="end" fontSize="14" fill="#5f5548">
            {model.clientCount} client(s)
          </text>

          <text x={clientColumnX} y={clientColumnY - 26} fontSize="11" fontWeight="700" letterSpacing="0.18em" fill="#5f5548">
            CLIENTS
          </text>
          {model.clientViews.map((view, index) => {
            const y = clientColumnY + index * (clientCardHeight + clientGap)
            const isWriter = view.client === model.writerClient

            return (
              <g key={view.id}>
                <rect
                  x={clientColumnX}
                  y={y}
                  width={clientCardWidth}
                  height={clientCardHeight}
                  rx="24"
                  fill={isWriter ? 'rgba(231,198,167,0.9)' : 'rgba(255,250,242,0.96)'}
                  stroke={isWriter ? '#c25737' : 'rgba(36,31,24,0.12)'}
                  strokeWidth="2"
                  className="scene-node-shadow"
                />
                <text x={clientColumnX + 22} y={y + 24} fontSize="10" fontWeight="700" letterSpacing="0.18em" fill="#78685c">
                  {isWriter ? 'WRITER CLIENT' : 'CLIENT'}
                </text>
                <text x={clientColumnX + 22} y={y + 48} fontSize="18" fontWeight="700" fill="#241f18">
                  {view.client}
                </text>
                <text x={clientColumnX + 22} y={y + 68} fontSize="12" fill="#5f5548">
                  voit {model.settingKey} = {view.visibleValue}
                </text>
              </g>
            )
          })}

          {connectionEntries.map((entry, index) => (
            <g key={entry.key}>
              <path
                d={entry.path}
                fill="none"
                stroke={entry.highlight ? '#c25737' : (useSingleton ? '#246b5e' : '#426c8d')}
                strokeWidth={entry.highlight ? '3.2' : '2.6'}
                strokeDasharray={entry.highlight ? '12 8' : '0'}
                markerEnd={`url(#${defsId}-arrow)`}
                className={entry.highlight ? 'scene-flow-line' : ''}
              />
              {entry.highlight ? (
                <circle r="5" fill="#c25737" opacity="0.95">
                  <animateMotion dur="1.9s" repeatCount="indefinite" path={entry.path} begin={`${index * 0.12}s`} />
                </circle>
              ) : null}
            </g>
          ))}

          {useSingleton ? (
            <g>
              <rect
                x={instanceColumnX}
                y={singleInstanceY}
                width={singleInstanceWidth}
                height={singleInstanceHeight}
                rx="34"
                fill="#241f18"
                stroke="#241f18"
                strokeWidth="2"
                className="scene-node-shadow"
              />
              <text x={instanceColumnX + 28} y={singleInstanceY + 30} fontSize="11" fontWeight="700" letterSpacing="0.18em" fill="rgba(255,250,242,0.64)">
                INSTANCE UNIQUE
              </text>
              <text x={instanceColumnX + 28} y={singleInstanceY + 72} fontSize="30" fontWeight="700" fill="#fff8ee">
                GlobalSettingsManager
              </text>
              <rect
                x={instanceColumnX + 28}
                y={singleInstanceY + 96}
                width={singleInstanceWidth - 56}
                height="54"
                rx="18"
                fill="rgba(255,250,242,0.1)"
                stroke="rgba(255,250,242,0.12)"
              />
              <text x={instanceColumnX + 48} y={singleInstanceY + 127} fontSize="14" fontWeight="700" fill="#fff8ee">
                {model.settingKey} = {model.settingValue}
              </text>
              <text x={instanceColumnX + 48} y={singleInstanceY + 148} fontSize="12" fill="rgba(255,250,242,0.7)">
                meme reference renvoyee a tous les clients
              </text>
              <text x={instanceColumnX + 28} y={singleInstanceY + 176} fontSize="12" fill="rgba(255,250,242,0.78)">
                Clients relies : {model.clientViews.map((view) => view.client).join(' · ')}
              </text>
            </g>
          ) : (
            instanceViews.map((instance, index) => {
              const y = stackedStartY + index * (stackedInstanceHeight + stackedInstanceGap)
              const isPrimary = instance.clients.includes(model.writerClient)

              return (
                <g key={instance.instanceId}>
                  <rect
                    x={instanceColumnX}
                    y={y}
                    width={stackedInstanceWidth}
                    height={stackedInstanceHeight}
                    rx="24"
                    fill={isPrimary ? 'rgba(231,198,167,0.9)' : 'rgba(214,228,241,0.94)'}
                    stroke={isPrimary ? '#c25737' : '#426c8d'}
                    strokeWidth="2"
                    className="scene-node-shadow"
                  />
                  <text x={instanceColumnX + 22} y={y + 24} fontSize="10" fontWeight="700" letterSpacing="0.18em" fill="#6c6257">
                    INSTANCE LOCALE
                  </text>
                  <text x={instanceColumnX + 22} y={y + 48} fontSize="19" fontWeight="700" fill="#241f18">
                    {instance.instanceId}
                  </text>
                  <text x={instanceColumnX + 22} y={y + 69} fontSize="12" fill="#5f5548">
                    {model.settingKey} = {instance.visibleValue}
                  </text>
                  <text x={instanceColumnX + stackedInstanceWidth - 22} y={y + 69} textAnchor="end" fontSize="12" fill="#5f5548">
                    {instance.clients.join(', ')}
                  </text>
                </g>
              )
            })
          )}
        </svg>
      </ZoomableViewport>
    </div>
  )
}
