// src/components/ui/use-toast.jsx
import * as React from "react"

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 1000000 // A long delay, but toasts can be dismissed manually

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
}

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

const toastTimeouts = new Map()

const addToRemoveQueue = (toastId) => {
  if (toastTimeouts.has(toastId)) {
    return
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({
      type: actionTypes.REMOVE_TOAST,
      toastId: toastId,
    })
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

export const reducer = (state, action) => {
  switch (action.type) {
    case actionTypes.ADD_TOAST:
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case actionTypes.UPDATE_TOAST:
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case actionTypes.DISMISS_TOAST:
      const { toastId } = action

      // ! This is basically a hack to get around the fact that we don't want to double-fire
      // the dismiss for a toast can be dismissed by a user clicking on it or using the escape key
      // this is done through an `onPointerDown` listener (container and viewport) and a `useEffect` cleanup
      if (toastId) {
        addToRemoveQueue(toastId)
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id)
        })
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      }
    case actionTypes.REMOVE_TOAST:
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
    default:
      throw new Error()
  }
}

const ToastContext = React.createContext(undefined)

export const ToastProvider = ({ children }) => {
  const [state, dispatch] = React.useReducer(reducer, {
    toasts: [],
  })

  return (
    <ToastContext.Provider value={{ state, dispatch }}>
      {children}
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const context = React.useContext(ToastContext)

  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider")
  }

  return {
    ...context,
    toast: React.useCallback((props) => {
      const id = genId()
      const dismiss = () => context.dispatch({ type: actionTypes.DISMISS_TOAST, toastId: id })
      const update = (props) => context.dispatch({ type: actionTypes.UPDATE_TOAST, toast: { ...props, id } })
      const promise = new Promise((resolve, reject) => {
        context.dispatch({ type: actionTypes.ADD_TOAST, toast: {
          ...props,
          id,
          open: true,
          dismiss,
          resolve,
          reject
        } })
      })

      return {
        id,
        dismiss,
        update,
        promise,
      }
    }, [context.dispatch]),
  }
}

