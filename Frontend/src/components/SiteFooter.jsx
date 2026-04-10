import { buildLegalNoticePath } from '../app/playgroundUtils'
import SpaLink from './SpaLink'

export default function SiteFooter({ onNavigateLegalNotice }) {
  const legalNoticePath = buildLegalNoticePath()

  return (
    <footer className="border-t border-black/8 bg-[rgba(255,249,239,0.78)] backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-5 text-sm text-stone-700 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <p className="font-medium text-stone-800">
          &copy; {new Date().getFullYear()} Adeline Meistertzheim &middot; Tous droits r&eacute;serv&eacute;s
        </p>

        <SpaLink
          className="inline-flex w-fit items-center gap-2 rounded-full border border-black/10 bg-white/84 px-4 py-2 font-semibold text-stone-800 transition hover:border-black/20"
          href={legalNoticePath}
          onNavigate={onNavigateLegalNotice}
        >
          Mentions l&eacute;gales et RGPD
        </SpaLink>
      </div>
    </footer>
  )
}
