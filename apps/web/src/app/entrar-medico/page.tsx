import EntrarMedicoClient from './EntrarMedicoClient'

export default function EntrarMedicoPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>
}) {
  const next = typeof searchParams?.next === 'string' ? searchParams.next : '/painel-medico/casos'
  return <EntrarMedicoClient nextPath={next} />
}

