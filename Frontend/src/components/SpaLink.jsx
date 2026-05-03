// Determine si le clic doit rester une navigation native (nouvel onglet, modif clavier, etc.).
function shouldBypassClientNavigation(event, target) {
  return event.defaultPrevented
    || event.button !== 0
    || event.metaKey
    || event.altKey
    || event.ctrlKey
    || event.shiftKey
    || target === '_blank'
}

export default function SpaLink({
  children,
  className,
  href,
  onClick,
  onNavigate,
  target,
  ...props
}) {
  // Lien SPA qui delegue la navigation au routeur client quand c est possible.
  return (
    <a
      {...props}
      className={className}
      href={href}
      target={target}
      onClick={(event) => {
        onClick?.(event)

        if (!onNavigate || shouldBypassClientNavigation(event, target)) {
          return
        }

        event.preventDefault()
        onNavigate(href)
      }}
    >
      {children}
    </a>
  )
}
