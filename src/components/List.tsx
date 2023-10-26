import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'

const TIME_TO_CONSIDER_REQUEST_AS_DELAY = 5000

enum FETCH_STATES {
  IDLE,
  DELAYED,
  LOADING,
  SUCCESS,
  ERROR,
}

const buttonText = (fetchStatus: FETCH_STATES) => {
  switch (fetchStatus) {
    case FETCH_STATES.IDLE:
      return 'Load Games'
    case FETCH_STATES.LOADING:
      return 'Loading...'
    case FETCH_STATES.DELAYED:
      return 'Loading...'
    case FETCH_STATES.SUCCESS:
      return 'Enjoy!'
    case FETCH_STATES.ERROR:
      return 'Load Games'
  }
}

type DBZCharacter = {
  id: string
  name: string
  img: string
  description: string
  link: string
}

const List = () => {
  const [characters, setCharacters] = useState<DBZCharacter[]>([])
  const [fetchStatus, setFetchStatus] = useState(FETCH_STATES.IDLE)
  const controllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    return () => {
      // Ensure the AbortController is aborted when the component unmounts
      if (controllerRef.current) {
        controllerRef.current.abort()
      }
    }
  }, [])

  useEffect(() => {
    if (fetchStatus === FETCH_STATES.DELAYED) {
      toast('Loading is taking longer than usual...', {
        icon: '⏳',
      })
    }
  }, [fetchStatus])

  const resetAndFetch = () => {
    // Create a new AbortController for the new fetch attempt
    controllerRef.current = new AbortController()
    setFetchStatus(FETCH_STATES.IDLE)
    getCharacters()
  }

  async function getCharacters() {
    if (!controllerRef.current) {
      // Ensure there's an AbortController before starting the fetch
      controllerRef.current = new AbortController()
    }

    setFetchStatus(FETCH_STATES.LOADING)

    const timeout = setTimeout(() => {
      setFetchStatus(FETCH_STATES.DELAYED)
    }, TIME_TO_CONSIDER_REQUEST_AS_DELAY)

    try {
      const response = await fetch('http://localhost:8080/characters', {
        signal: controllerRef.current.signal,
      })
      const data = await response.json()

      setCharacters(data)
      setFetchStatus(FETCH_STATES.SUCCESS)
    } catch (error: any) {
      if (error.name === 'AbortError') {
        toast.error('Request timed out. Check your internet connection.')
      } else {
        console.error('Fetch error:', error)
      }
      setFetchStatus(FETCH_STATES.ERROR)
    } finally {
      clearTimeout(timeout)
    }
  }

  return (
    <div className="flex flex-col justify-center items-center w-full gap-2 ">
      <h1 className="text-3xl mb-12">
        My view on fetching with poor connection
      </h1>

      {fetchStatus !== FETCH_STATES.ERROR && (
        <button
          className="disabled:bg-gray-600 disabled:cursor-not-allowed"
          disabled={
            fetchStatus === FETCH_STATES.LOADING ||
            fetchStatus === FETCH_STATES.DELAYED ||
            fetchStatus === FETCH_STATES.SUCCESS
          }
          onClick={() => getCharacters()}
        >
          {buttonText(fetchStatus)}
        </button>
      )}

      {fetchStatus === FETCH_STATES.SUCCESS && (
        <ul
          className="grid gap-y-20 gap-x-12 w-full place-items-center my-12 lg:min-h-[550px]"
          style={{
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          }}
        >
          {characters &&
            characters.slice(0, 6).map((user: DBZCharacter) => (
              <li className="text-white" key={user.id}>
                <a
                  target="_blank"
                  rel="noreferrer nofollow"
                  href={user.link}
                  className="text-gray-600 flex hover:scale-105 focus-visible:scale-105 transition-transform hover:text-gray-600 focus-visible:text-gray-600"
                >
                  <figure className="flex flex-col items-center text-center gap-2">
                    <img
                      className="rounded-full w-40 h-40 border border-b"
                      src={user.img}
                      alt={user.name}
                    />
                    <figcaption>{user.name}</figcaption>
                  </figure>
                </a>
              </li>
            ))}
        </ul>
      )}

      {fetchStatus === FETCH_STATES.LOADING && (
        <ul
          className="grid gap-y-20 gap-x-12 w-full place-items-center my-12 lg:min-h-[550px]"
          style={{
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          }}
        >
          {Array.from({ length: 6 }).map((_, index) => (
            <li key={index}>
              <div className="flex flex-col items-center text-center gap-2">
                <div className="rounded-full w-40 h-40 border border-b bg-gray-400 animate-pulse" />
                <div className="w-20 bg-gray-700 animate-pulse h-3"></div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {fetchStatus === FETCH_STATES.DELAYED && (
        <div className="lg:min-h-[550px] w-full">
          <ul
            className="grid gap-y-20 gap-x-12 w-full place-items-center my-12"
            style={{
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            }}
          >
            {Array.from({ length: 6 }).map((_, index) => (
              <li key={index}>
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="rounded-full w-40 h-40 border border-b bg-gray-400 animate-pulse" />
                  <div className="w-20 bg-gray-700 animate-pulse h-3"></div>
                </div>
              </li>
            ))}
          </ul>
          <button
            onClick={() => controllerRef.current?.abort()}
            className="mx-auto flex"
          >
            Cancel the request
          </button>
        </div>
      )}

      {fetchStatus === FETCH_STATES.IDLE && (
        <div className="grid gap-y-20 gap-x-12 w-full place-items-center my-12 lg:min-h-[550px]">
          Press the button to load the list
        </div>
      )}

      {fetchStatus === FETCH_STATES.ERROR && (
        <div className="grid gap-y-20 gap-x-12 w-full place-items-center my-12 lg:min-h-[550px]">
          <div className="text-red-500">Error loading the list</div>
          <button onClick={resetAndFetch} className="retry-button">
            Retry
          </button>
        </div>
      )}
    </div>
  )
}

export default List
