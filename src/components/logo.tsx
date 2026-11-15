import Link from 'next/link'

// The Figma asset ships with a fixed fill, so it is used as a mask and coloured by the text token.
export function Logo() {
  return (
    <Link href="/overview" aria-label="Preallo, home" className="flex items-center px-3 pt-3 pb-5">
      <span
        className="block h-[1.4766rem] w-[7.2351rem] bg-[var(--text)]"
        style={{
          maskImage: 'url(/preallo-logo.svg)',
          WebkitMaskImage: 'url(/preallo-logo.svg)',
          maskSize: '100% 100%',
          WebkitMaskSize: '100% 100%',
          maskRepeat: 'no-repeat',
          WebkitMaskRepeat: 'no-repeat',
        }}
      />
    </Link>
  )
}
