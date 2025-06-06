import React, { ComponentType, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { Provider, useDispatch } from 'react-redux'
import { BrowserRouter, Route, Routes, useNavigate } from 'react-router-dom'
import { ErrorBoundaryProvider } from './components/ErrorBoundary/ErrorBoundaryContext'
import { ErrorBoundaryWrapper } from './components/ErrorBoundary/ErrorBoundaryWrapper'
import { REDIRECT_URI } from './constants'
import './index.css'
import { RouteConfig, routes } from './routes'
import { UserService } from './services/UserService'
import { startServiceWorker } from './serviceWorker'
import { signinWithYandex } from './slices/authSlice'
import { AppDispatch, createStore } from './store/store'
import ThemeProvider from './theme/ThemeProvider'

const preloadedState = window.__PRELOADED_STATE__ || {}
delete window.__PRELOADED_STATE__

const userService = new UserService()
const store = createStore(preloadedState, userService)

const App: React.FC = () => {
  // Функция для рендеринга элемента в зависимости от типа component
  const renderRouteElement = (component: RouteConfig['component']) => {
    if (typeof component === 'function') {
      const Component = component as ComponentType<any>
      return <Component />
    }
    return component
  }

  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  useEffect(() => {
    // Функция для извлечения параметров из URL
    function getQueryParams() {
      const urlParams = new URLSearchParams(window.location.search)
      const code = urlParams.get('code')
      const cid = urlParams.get('cid')
      console.log(code, cid)
      return { code }
    }

    const Query: Record<string, string | null> = getQueryParams()
    Query['redirect_uri'] = REDIRECT_URI

    console.log(Query)

    if (Query.code !== null) {
      const CodeAndCid: Record<string, string> = {
        code: Query.code as string, // Явно приводим значение к типу string
        redirect_uri: REDIRECT_URI,
      }
      dispatch(signinWithYandex({ CodeAndCid }))
        .unwrap()
        .then(() => {
          console.log('Успех')
          navigate('/game')
        })
        .catch(() => {
          console.log('Не успех')
          return
        })
    }
  }, [])

  return (
    <ErrorBoundaryProvider>
      <ErrorBoundaryWrapper>
        <ThemeProvider>
          <Routes>
            {routes.map(route => (
              <Route
                key={route.path}
                path={route.path}
                element={renderRouteElement(route.component)}
              />
            ))}
          </Routes>
        </ThemeProvider>
      </ErrorBoundaryWrapper>
    </ErrorBoundaryProvider>
  )
}

// ReactDOM.hydrateRoot(document.getElementById('root') as HTMLElement, <App />)

ReactDOM.hydrateRoot(
  document.getElementById('root') as HTMLElement,
  <React.StrictMode>
    <BrowserRouter>
      <Provider store={store}>
        <App />
      </Provider>
    </BrowserRouter>
  </React.StrictMode>
)

startServiceWorker()
