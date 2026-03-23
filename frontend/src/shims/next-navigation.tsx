import { useLocation, useNavigate, useSearchParams as useRRSearchParams } from 'react-router-dom'

export function useRouter() {
  const navigate = useNavigate()

  return {
    push: (to: string) => navigate(to),
    back: () => navigate(-1),
  }
}

export function usePathname() {
  return useLocation().pathname
}

export function useSearchParams() {
  const [params] = useRRSearchParams()
  return params
}

